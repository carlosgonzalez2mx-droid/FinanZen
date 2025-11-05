import React, { useMemo } from 'react';
import type { CategoryDetailData, Transaction } from '../types';
import { XMarkIcon } from './Icons';
import TransactionItem from './TransactionItem';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryData: CategoryDetailData | null;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const SubcategoryRow: React.FC<{
    name: string;
    spent: number;
    budgeted: number;
}> = ({ name, spent, budgeted }) => {
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
    const progressBarColor = percentage > 100 ? 'bg-red-500' : 'bg-brand-primary';

    return (
        <div className="py-2">
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-text-primary">{name}</span>
                <span className="text-text-secondary">{formatCurrency(spent)} / {formatCurrency(budgeted)}</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
                <div className={`${progressBarColor} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
        </div>
    );
}


const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, onClose, categoryData }) => {
  if (!isOpen || !categoryData) return null;

  const { name, subcategories, transactions, budgetPlan } = categoryData;
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const subcategoryDetails = useMemo(() => {
    return subcategories.map(sub => {
        const budgeted = budgetPlan[sub] || 0;
        const spent = transactions
            .filter(t => t.subcategory === sub)
            .reduce((sum, t) => sum + t.amount, 0);
        return { name: sub, budgeted, spent };
    }).filter(s => s.budgeted > 0 || s.spent > 0);
  }, [subcategories, transactions, budgetPlan]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-base-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">Detalle de: {name}</h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Desglose por Subcategoría</h3>
                <div className="bg-base-200 p-4 rounded-lg space-y-2 divide-y divide-base-300">
                    {subcategoryDetails.length > 0 ? (
                        subcategoryDetails.map(sub => <SubcategoryRow key={sub.name} {...sub} />)
                    ) : (
                        <p className="text-text-secondary text-center py-4">No hay datos de presupuesto o gastos para las subcategorías.</p>
                    )}
                </div>
            </div>

            <div>
                 <h3 className="text-lg font-semibold text-text-primary mb-3">Historial de Transacciones</h3>
                 <div className="space-y-3">
                    {sortedTransactions.length > 0 ? (
                        sortedTransactions.map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))
                    ) : (
                        <p className="bg-base-200 p-4 rounded-lg text-text-secondary text-center">No hay transacciones en esta categoría.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-base-300 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-base-300 rounded-md hover:bg-slate-600">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;