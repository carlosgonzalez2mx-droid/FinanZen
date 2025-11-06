import React, { useState, useMemo } from 'react';
import type { Transaction, MainCategory, MutableBudgetCategory } from '../types';
import { ChevronDownIcon, DocumentArrowUpIcon, PencilIcon, TrashIcon, CheckIcon, PlusCircleIcon, FolderIcon, DocumentTextIcon } from './Icons';

interface BudgetPageProps {
  transactions: Transaction[];
  budgetPlan: Record<string, number>;
  setBudgetPlan: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onBudgetUpload: (file: File) => Promise<void>;
  budgetCategories: MutableBudgetCategory[];
  onAddSubcategory: (mainCategory: MainCategory, newSubcategoryName: string) => void;
  onUpdateSubcategory: (mainCategory: MainCategory, oldName: string, newName: string) => void;
  onDeleteSubcategory: (mainCategory: MainCategory, subcategoryName: string) => void;
  onClearBudget: () => void;
  onOpenTemplateManager: () => void;
  onOpenCycleReport: () => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);


const SubcategoryBudgetRow: React.FC<{
  mainCategory: MainCategory;
  subcategory: string;
  budgeted: number;
  spent: number;
  onBudgetChange: (subcategory: string, amount: number) => void;
  onUpdate: (mainCategory: MainCategory, oldName: string, newName: string) => void;
  onDelete: (mainCategory: MainCategory, subcategoryName: string) => void;
  allSubcategories: string[];
}> = ({ mainCategory, subcategory, budgeted, spent, onBudgetChange, onUpdate, onDelete, allSubcategories }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(subcategory);
  const [inputValue, setInputValue] = useState(budgeted.toString());
  
  const remaining = budgeted - spent;
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const progressBarColor = percentage > 100 ? 'bg-red-500' : 'bg-brand-primary';

  const handleBudgetBlur = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      onBudgetChange(subcategory, value);
    } else {
       onBudgetChange(subcategory, 0);
       setInputValue('0');
    }
  };
  
  const handleNameSave = () => {
    if (editingNameValue.trim() === '') {
      alert('El nombre de la subcategoría no puede estar vacío.');
      setEditingNameValue(subcategory);
      setIsEditingName(false);
      return;
    }
    if (editingNameValue.toLowerCase() !== subcategory.toLowerCase() && allSubcategories.find(s => s.toLowerCase() === editingNameValue.toLowerCase())) {
        alert('Ya existe una subcategoría con este nombre.');
        setEditingNameValue(subcategory);
        setIsEditingName(false);
        return;
    }
    onUpdate(mainCategory, subcategory, editingNameValue.trim());
    setIsEditingName(false);
  };
  
  React.useEffect(() => {
    setInputValue(budgeted.toString());
  }, [budgeted]);

  return (
    <div className="group grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-3 px-4 hover:bg-base-200">
      <div className="font-medium text-text-primary flex items-center gap-2">
        {isEditingName ? (
            <input 
              type="text"
              value={editingNameValue}
              onChange={(e) => setEditingNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="bg-base-200 text-text-primary border border-brand-primary rounded-md px-2 py-1 w-full"
              autoFocus
            />
        ) : (
          <span>{subcategory}</span>
        )}
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditingName ? (
                <button onClick={handleNameSave} className="text-green-400 hover:text-green-300"><CheckIcon className="h-4 w-4" /></button>
            ) : (
                <button onClick={() => setIsEditingName(true)} className="text-text-secondary hover:text-text-primary"><PencilIcon className="h-4 w-4" /></button>
            )}
            <button onClick={() => onDelete(mainCategory, subcategory)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-text-secondary mr-1">$</span>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBudgetBlur}
          placeholder="0"
          className="bg-base-300 text-text-primary border-transparent rounded-md px-2 py-1 w-full text-right"
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">{formatCurrency(spent)}</span>
          <span className={`font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2">
          <div className={`${progressBarColor} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
      </div>
      <p className="hidden md:block text-right text-text-secondary">{percentage.toFixed(0)}% Gastado</p>
    </div>
  );
};

const AddSubcategoryForm: React.FC<{
    mainCategory: MainCategory;
    onAdd: (mainCategory: MainCategory, newName: string) => void;
}> = ({ mainCategory, onAdd }) => {
    const [name, setName] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const handleSave = () => {
        if (name.trim()) {
            onAdd(mainCategory, name.trim());
            setName('');
            setIsVisible(false);
        }
    };

    if (!isVisible) {
        return (
            <div className="px-4 py-2">
                <button onClick={() => setIsVisible(true)} className="flex items-center gap-2 text-sm text-brand-primary hover:underline">
                    <PlusCircleIcon className="h-4 w-4" />
                    Añadir Subcategoría
                </button>
            </div>
        )
    }

    return (
        <div className="p-4 bg-base-200 flex items-center gap-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Nombre de la nueva subcategoría"
                className="bg-base-300 text-text-primary border-transparent rounded-md px-2 py-1 w-full"
                autoFocus
            />
            <button onClick={handleSave} className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md">Guardar</button>
            <button onClick={() => setIsVisible(false)} className="px-3 py-1 text-sm bg-base-300 text-text-primary rounded-md">Cancelar</button>
        </div>
    )
}


const BudgetCategoryItem: React.FC<{
  category: MainCategory;
  subcategories: string[];
  transactions: Transaction[];
  budgetPlan: Record<string, number>;
  onBudgetChange: (subcategory: string, amount: number) => void;
  onAddSubcategory: (mainCategory: MainCategory, newSubcategoryName: string) => void;
  onUpdateSubcategory: (mainCategory: MainCategory, oldName: string, newName: string) => void;
  onDeleteSubcategory: (mainCategory: MainCategory, subcategoryName: string) => void;
}> = (props) => {
  const { category, subcategories, transactions, budgetPlan, onBudgetChange, onAddSubcategory, onUpdateSubcategory, onDeleteSubcategory } = props;
  const [isOpen, setIsOpen] = useState(false);

  const categoryTotals = useMemo(() => {
    let totalBudgeted = 0;
    let totalSpent = 0;
    for (const sub of subcategories) {
      const budgeted = budgetPlan[sub] || 0;
      // Fix: Add explicit types to reduce to prevent potential type inference issues.
      const spent = transactions
        .filter(t => t.subcategory === sub)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      totalBudgeted += budgeted;
      totalSpent += spent;
    }
    return { totalBudgeted, totalSpent };
  }, [subcategories, transactions, budgetPlan]);
  
  const { totalBudgeted, totalSpent } = categoryTotals;
  const totalRemaining = totalBudgeted - totalSpent;
  const totalPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const totalProgressBarColor = totalPercentage > 100 ? 'bg-red-500' : 'bg-brand-secondary';


  return (
    <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <h3 className="text-lg font-semibold text-text-primary">{category}</h3>
        <div className="flex items-center gap-4">
            <div className="hidden md:block w-48">
                 <div className="w-full bg-base-300 rounded-full h-2.5">
                    <div className={`${totalProgressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(totalPercentage, 100)}%` }}></div>
                </div>
            </div>
            <p className="text-sm font-medium text-text-secondary">{formatCurrency(totalSpent)} / {formatCurrency(totalBudgeted)}</p>
            <ChevronDownIcon className={`h-5 w-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-base-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 px-4 bg-base-200 text-xs text-text-secondary font-bold uppercase">
              <span>Subcategoría</span>
              <span className="text-right">Presupuestado</span>
              <span>Gastado vs Restante</span>
              <span className="text-right">Progreso</span>
          </div>
          <div className="divide-y divide-base-300">
             {subcategories.map(sub => {
                const spent = transactions
                    .filter(t => t.subcategory === sub)
                    .reduce((sum, t) => sum + t.amount, 0);
                return (
                    <SubcategoryBudgetRow
                        key={sub}
                        mainCategory={category}
                        subcategory={sub}
                        budgeted={budgetPlan[sub] || 0}
                        spent={spent}
                        onBudgetChange={onBudgetChange}
                        onUpdate={onUpdateSubcategory}
                        onDelete={onDeleteSubcategory}
                        allSubcategories={subcategories}
                    />
                );
            })}
          </div>
          <AddSubcategoryForm mainCategory={category} onAdd={onAddSubcategory} />
        </div>
      )}
    </div>
  );
};


const BudgetPage: React.FC<BudgetPageProps> = ({ transactions, budgetPlan, setBudgetPlan, onBudgetUpload, budgetCategories, onAddSubcategory, onUpdateSubcategory, onDeleteSubcategory, onClearBudget, onOpenTemplateManager, onOpenCycleReport }) => {
  const [isAnalyzingPDF, setIsAnalyzingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleBudgetChange = (subcategory: string, amount: number) => {
    const updatedPlan = {...budgetPlan, [subcategory]: amount};
    setBudgetPlan(updatedPlan);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsAnalyzingPDF(true);
        setPdfError(null);
        try {
          await onBudgetUpload(file);
        } catch (error) {
          console.error(error);
          setPdfError('Hubo un error al procesar el PDF. Intenta de nuevo.');
        } finally {
          setIsAnalyzingPDF(false);
          e.target.value = '';
        }
      }
    };

  // Fix: Add explicit types to reduce to prevent potential type inference issues.
  const totalBudgeted = useMemo(() => Object.values(budgetPlan).reduce((sum: number, val: number) => sum + val, 0), [budgetPlan]);
  const totalSpent = useMemo(() => transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0), [transactions]);

  return (
    <div className="space-y-8">
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                 <h2 className="text-xl font-semibold text-text-primary">Plan de Presupuesto Mensual</h2>
                 <p className="text-text-secondary mt-1">Asigna un presupuesto a cada subcategoría para llevar un control de tus gastos.</p>
            </div>
             <div className="flex items-center gap-2 flex-wrap">
                <button onClick={onOpenTemplateManager} className="flex items-center gap-2 py-2 px-4 border border-base-300 rounded-md shadow-sm text-sm font-medium text-text-primary bg-base-100 hover:bg-base-200">
                    <FolderIcon className="h-5 w-5"/> Administrar Plantillas
                </button>
                 <button onClick={onOpenCycleReport} className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-500">
                    <DocumentTextIcon className="h-5 w-5"/> Cerrar Ciclo y Reportar
                </button>
                <button
                  onClick={onClearBudget}
                  className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                >
                  <TrashIcon className="h-5 w-5"/>
                  Borrar Presupuesto
                </button>
                <input type="file" id="pdf-upload" accept="application/pdf" className="hidden" onChange={handleFileSelect} disabled={isAnalyzingPDF} />
                <button
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  disabled={isAnalyzingPDF}
                  className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-secondary hover:bg-emerald-500 disabled:bg-emerald-700 disabled:cursor-not-allowed"
                >
                  {isAnalyzingPDF ? <Spinner/> : <DocumentArrowUpIcon className="h-5 w-5"/>}
                  {isAnalyzingPDF ? 'Analizando...' : 'Importar desde PDF'}
                </button>
             </div>
        </div>
        {pdfError && <p className="text-red-500 text-sm mt-2 text-center">{pdfError}</p>}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-base-200 p-4 rounded-md">
                <p className="text-sm text-text-secondary">Presupuesto Total</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="bg-base-200 p-4 rounded-md">
                <p className="text-sm text-text-secondary">Gasto Total</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-base-200 p-4 rounded-md">
                <p className="text-sm text-text-secondary">Restante General</p>
                <p className={`text-2xl font-bold ${totalBudgeted-totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(totalBudgeted-totalSpent)}</p>
            </div>
        </div>
      </div>
      <div className="space-y-4">
        {budgetCategories.map(cat => (
          <BudgetCategoryItem 
            key={cat.name}
            category={cat.name}
            subcategories={cat.subcategories}
            transactions={transactions.filter(t => t.category === cat.name)}
            budgetPlan={budgetPlan}
            onBudgetChange={handleBudgetChange}
            onAddSubcategory={onAddSubcategory}
            onUpdateSubcategory={onUpdateSubcategory}
            onDeleteSubcategory={onDeleteSubcategory}
          />
        ))}
      </div>
    </div>
  );
};

export default BudgetPage;