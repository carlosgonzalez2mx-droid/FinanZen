import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { INITIAL_PAYMENT_METHODS } from '../constants';
import type { User } from 'firebase/auth';
import { useNotification } from '../contexts/ErrorContext';

export const usePaymentMethods = (user: User | null) => {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const { showNotification } = useNotification();

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) {
      setPaymentMethods([]);
      return;
    }

    try {
      const pmQuery = query(collection(db, 'payment_methods'), where('user_id', '==', user.uid));
      const pmSnap = await getDocs(pmQuery);

      if (!pmSnap.empty) {
        setPaymentMethods(pmSnap.docs.map(d => d.data().name));
      } else {
        const batch = writeBatch(db);
        INITIAL_PAYMENT_METHODS.forEach(name => {
          const newPMRef = doc(collection(db, 'payment_methods'));
          batch.set(newPMRef, { user_id: user.uid, name });
        });
        await batch.commit();
        setPaymentMethods(INITIAL_PAYMENT_METHODS);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      showNotification('Error al cargar los métodos de pago', 'error');
    }
  }, [user, showNotification]);

  const addPaymentMethod = useCallback(async (name: string): Promise<boolean> => {
    if (paymentMethods.find(pm => pm.toLowerCase() === name.toLowerCase())) {
      showNotification('El método de pago ya existe', 'warning');
      return false;
    }

    if (!user) return false;

    try {
      await addDoc(collection(db, 'payment_methods'), { user_id: user.uid, name });
      await fetchPaymentMethods();
      showNotification('Método de pago añadido exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error adding payment method:', error);
      showNotification('Error al añadir el método de pago', 'error');
      return false;
    }
  }, [user, paymentMethods, fetchPaymentMethods, showNotification]);

  const updatePaymentMethod = useCallback(async (oldName: string, newName: string): Promise<boolean> => {
    if (oldName.toLowerCase() !== newName.toLowerCase() &&
        paymentMethods.find(pm => pm.toLowerCase() === newName.toLowerCase())) {
      showNotification('Ya existe un método de pago con este nombre', 'warning');
      return false;
    }

    if (!user) return false;

    try {
      const batch = writeBatch(db);

      // Update payment_methods doc
      const pmQuery = query(
        collection(db, 'payment_methods'),
        where('user_id', '==', user.uid),
        where('name', '==', oldName)
      );
      const pmSnap = await getDocs(pmQuery);
      pmSnap.forEach(doc => batch.update(doc.ref, { name: newName }));

      // Update transactions
      const transQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.uid),
        where('paymentMethod', '==', oldName)
      );
      const transSnap = await getDocs(transQuery);
      transSnap.forEach(doc => batch.update(doc.ref, { paymentMethod: newName }));

      await batch.commit();
      await fetchPaymentMethods();
      showNotification('Método de pago actualizado exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error updating payment method:', error);
      showNotification('Error al actualizar el método de pago', 'error');
      return false;
    }
  }, [user, paymentMethods, fetchPaymentMethods, showNotification]);

  const deletePaymentMethod = useCallback(async (name: string, transactions: any[]) => {
    if (transactions.some(t => t.paymentMethod === name)) {
      showNotification('No se puede eliminar el método de pago porque está siendo utilizado en transacciones', 'warning');
      return;
    }

    if (!user) return;

    try {
      const pmQuery = query(
        collection(db, 'payment_methods'),
        where('user_id', '==', user.uid),
        where('name', '==', name)
      );
      const pmSnap = await getDocs(pmQuery);
      pmSnap.forEach(doc => deleteDoc(doc.ref));
      await fetchPaymentMethods();
      showNotification('Método de pago eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      showNotification('Error al eliminar el método de pago', 'error');
      throw error;
    }
  }, [user, fetchPaymentMethods, showNotification]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refetchPaymentMethods: fetchPaymentMethods
  };
};
