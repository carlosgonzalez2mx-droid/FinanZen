import { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDoc, getDocs, query, where, addDoc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';
import type { MutableBudgetCategory, MainCategory, BudgetTemplate } from '../types';
import { INITIAL_BUDGET_CATEGORIES } from '../constants';
import type { User } from 'firebase/auth';
import { useNotification } from '../contexts/ErrorContext';
import { analyzeBudgetPDF } from '../services/geminiService';

export const useBudget = (user: User | null) => {
  const [budgetPlan, setBudgetPlan] = useState<Record<string, number>>({});
  const [budgetCategories, setBudgetCategories] = useState<MutableBudgetCategory[]>([]);
  const [budgetTemplates, setBudgetTemplates] = useState<BudgetTemplate[]>([]);
  const { showNotification } = useNotification();

  const fetchBudgetData = useCallback(async () => {
    if (!user) {
      setBudgetPlan({});
      setBudgetCategories([]);
      setBudgetTemplates([]);
      return;
    }

    try {
      // Fetch Budget Categories
      const catQuery = query(collection(db, 'user_categories'), where('user_id', '==', user.uid));
      const catSnap = await getDocs(catQuery);

      if (!catSnap.empty) {
        const dbCategories = catSnap.docs.map(d => d.data());
        const grouped = dbCategories.reduce((acc, current) => {
          acc[current.main_category] = acc[current.main_category] || [];
          acc[current.main_category].push(current.subcategory);
          return acc;
        }, {} as Record<string, string[]>);
        const mutableCategories = Object.entries(grouped).map(([name, subcategories]) => ({
          name: name as MainCategory,
          subcategories
        }));
        setBudgetCategories(mutableCategories);
      } else {
        const batch = writeBatch(db);
        INITIAL_BUDGET_CATEGORIES.forEach(cat => {
          cat.subcategories.forEach(sub => {
            const newCatRef = doc(collection(db, 'user_categories'));
            batch.set(newCatRef, { user_id: user.uid, main_category: cat.name, subcategory: sub });
          });
        });
        await batch.commit();
        setBudgetCategories(INITIAL_BUDGET_CATEGORIES.map(c => ({ ...c, subcategories: [...c.subcategories] })));
      }

      // Fetch Budget Plan
      const planRef = doc(db, 'budget_plans', user.uid);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        setBudgetPlan(planSnap.data() as Record<string, number>);
      } else {
        setBudgetPlan({});
      }

      // Fetch Templates
      const templateQuery = query(collection(db, 'budget_templates'), where('user_id', '==', user.uid));
      const templateSnap = await getDocs(templateQuery);
      setBudgetTemplates(templateSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BudgetTemplate[]);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      showNotification('Error al cargar los datos del presupuesto', 'error');
    }
  }, [user, showNotification]);

  const setBudgetPlanData = useCallback(async (newPlan: Record<string, number>) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'budget_plans', user.uid), newPlan);
      setBudgetPlan(newPlan);
      showNotification('Presupuesto actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error setting budget plan:', error);
      showNotification('Error al actualizar el presupuesto', 'error');
      throw error;
    }
  }, [user, showNotification]);

  const uploadBudgetPDF = useCallback(async (file: File) => {
    if (!user) return;

    try {
      const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const dataUri = await fileToDataUri(file);
      const base64Pdf = dataUri.split(',')[1];
      const budgetItems = await analyzeBudgetPDF(base64Pdf);

      if (budgetItems.length > 0) {
        const newPlan = budgetItems.reduce((acc, item) => {
          acc[item.subcategory] = item.amount;
          return acc;
        }, {} as Record<string, number>);
        await setDoc(doc(db, 'budget_plans', user.uid), newPlan, { merge: true });
        await fetchBudgetData();
        showNotification('Presupuesto importado desde PDF exitosamente', 'success');
      } else {
        showNotification('No se encontraron datos de presupuesto en el PDF', 'warning');
      }
    } catch (error) {
      console.error('Error uploading budget PDF:', error);
      showNotification('Error al procesar el PDF. Por favor, intenta de nuevo.', 'error');
      throw error;
    }
  }, [user, fetchBudgetData, showNotification]);

  const addSubcategory = useCallback(async (mainCategory: MainCategory, newSubcategoryName: string) => {
    if (!user) return;

    if (budgetCategories.flatMap(c => c.subcategories).some(s => s.toLowerCase() === newSubcategoryName.toLowerCase())) {
      showNotification('La subcategoría ya existe', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'user_categories'), {
        user_id: user.uid,
        main_category: mainCategory,
        subcategory: newSubcategoryName
      });
      await fetchBudgetData();
      showNotification('Subcategoría añadida exitosamente', 'success');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      showNotification('Error al añadir la subcategoría', 'error');
      throw error;
    }
  }, [user, budgetCategories, fetchBudgetData, showNotification]);

  const updateSubcategory = useCallback(async (mainCategory: MainCategory, oldName: string, newName: string) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      // Update in user_categories
      const catQuery = query(
        collection(db, 'user_categories'),
        where('user_id', '==', user.uid),
        where('main_category', '==', mainCategory),
        where('subcategory', '==', oldName)
      );
      const catSnap = await getDocs(catQuery);
      catSnap.forEach(doc => batch.update(doc.ref, { subcategory: newName }));

      // Update in transactions
      const transQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.uid),
        where('subcategory', '==', oldName)
      );
      const transSnap = await getDocs(transQuery);
      transSnap.forEach(doc => batch.update(doc.ref, { subcategory: newName }));

      await batch.commit();

      // Update in budget_plan
      const planRef = doc(db, 'budget_plans', user.uid);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        const currentPlan = planSnap.data();
        if (currentPlan[oldName] !== undefined) {
          const newPlan = { ...currentPlan, [newName]: currentPlan[oldName] };
          delete newPlan[oldName];
          await setDoc(planRef, newPlan);
        }
      }

      await fetchBudgetData();
      showNotification('Subcategoría actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error updating subcategory:', error);
      showNotification('Error al actualizar la subcategoría', 'error');
      throw error;
    }
  }, [user, fetchBudgetData, showNotification]);

  const deleteSubcategory = useCallback(async (mainCategory: MainCategory, subcategoryName: string) => {
    if (!user) return;

    try {
      // Delete from user_categories
      const catQuery = query(
        collection(db, 'user_categories'),
        where('user_id', '==', user.uid),
        where('main_category', '==', mainCategory),
        where('subcategory', '==', subcategoryName)
      );
      const catSnap = await getDocs(catQuery);
      catSnap.forEach(doc => deleteDoc(doc.ref));

      // Delete from budget plan
      const planRef = doc(db, 'budget_plans', user.uid);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        const currentPlan = planSnap.data();
        if (currentPlan[subcategoryName] !== undefined) {
          delete currentPlan[subcategoryName];
          await setDoc(planRef, currentPlan);
        }
      }

      await fetchBudgetData();
      showNotification('Subcategoría eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      showNotification('Error al eliminar la subcategoría', 'error');
      throw error;
    }
  }, [user, fetchBudgetData, showNotification]);

  const saveTemplate = useCallback(async (name: string, overwrite: boolean = false) => {
    if (!user || !name.trim()) return;

    try {
      const existingQuery = query(
        collection(db, 'budget_templates'),
        where('user_id', '==', user.uid),
        where('name', '==', name.trim())
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty && !overwrite) {
        showNotification('Ya existe una plantilla con ese nombre', 'warning');
        return;
      }

      const newTemplate = {
        user_id: user.uid,
        name: name.trim(),
        plan: budgetPlan,
        categories: budgetCategories,
        created_at: new Date().toISOString()
      };

      if (!existingSnap.empty) {
        await setDoc(doc(db, 'budget_templates', existingSnap.docs[0].id), newTemplate);
      } else {
        await addDoc(collection(db, 'budget_templates'), newTemplate);
      }

      await fetchBudgetData();
      showNotification('Plantilla guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification('Error al guardar la plantilla', 'error');
      throw error;
    }
  }, [user, budgetPlan, budgetCategories, fetchBudgetData, showNotification]);

  const loadTemplate = useCallback(async (templateName: string) => {
    const template = budgetTemplates.find(t => t.name === templateName);
    if (template && user) {
      try {
        await setBudgetPlanData(template.plan);
        showNotification('Plantilla cargada exitosamente', 'success');
      } catch (error) {
        console.error('Error loading template:', error);
        showNotification('Error al cargar la plantilla', 'error');
      }
    }
  }, [budgetTemplates, user, setBudgetPlanData, showNotification]);

  const deleteTemplate = useCallback(async (templateName: string) => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'budget_templates'),
        where('user_id', '==', user.uid),
        where('name', '==', templateName)
      );
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref));
      await fetchBudgetData();
      showNotification('Plantilla eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification('Error al eliminar la plantilla', 'error');
      throw error;
    }
  }, [user, fetchBudgetData, showNotification]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  return {
    budgetPlan,
    budgetCategories,
    budgetTemplates,
    setBudgetPlan: setBudgetPlanData,
    uploadBudgetPDF,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    refetchBudget: fetchBudgetData
  };
};
