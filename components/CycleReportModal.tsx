import React, { useMemo } from 'react';
import type { Transaction, MutableBudgetCategory } from '../types';
import { XMarkIcon, DocumentArrowUpIcon } from './Icons';

interface CycleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgetPlan: Record<string, number>;
  budgetCategories: MutableBudgetCategory[];
  onConfirmNewCycle: () => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const CycleReportModal: React.FC<CycleReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budgetPlan,
  budgetCategories,
  onConfirmNewCycle,
}) => {
  if (!isOpen) return null;

  const reportData = useMemo(() => {
    const allSubcategories = budgetCategories.flatMap(c => c.subcategories);
    const data = allSubcategories.map(sub => {
      const budgeted = budgetPlan[sub] || 0;
      const spent = transactions
        .filter(t => t.subcategory === sub)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        subcategory: sub,
        budgeted,
        spent,
        difference: budgeted - spent,
      };
    }).filter(item => item.budgeted > 0 || item.spent > 0); // Only show relevant items

    return data;
  }, [transactions, budgetPlan, budgetCategories]);
  
  const totals = useMemo(() => {
      const totalBudgeted = reportData.reduce((sum, item) => sum + item.budgeted, 0);
      const totalSpent = reportData.reduce((sum, item) => sum + item.spent, 0);
      return {
        totalBudgeted,
        totalSpent,
        netSaving: totalBudgeted - totalSpent
      };
  }, [reportData]);

  const handleExport = () => {
    const headers = ["Subcategoría", "Presupuestado", "Gastado", "Diferencia"];
    const csvRows = [headers.join(',')];

    for (const item of reportData) {
        const values = [
            `"${item.subcategory.replace(/"/g, '""')}"`, // Escape double quotes
            item.budgeted,
            item.spent,
            item.difference
        ];
        csvRows.push(values.join(','));
    }
    
    csvRows.push('');
    csvRows.push(`"Total Presupuestado",${totals.totalBudgeted}`);
    csvRows.push(`"Total Gastado",${totals.totalSpent}`);
    csvRows.push(`"Ahorro Neto",${totals.netSaving}`);

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `reporte-financiero-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-base-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">Reporte de Fin de Ciclo</h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
           <p className="text-sm text-text-secondary mt-1">Aquí tienes un resumen de tu rendimiento financiero para este período.</p>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-base-200 p-4 rounded-md">
                    <p className="text-sm text-text-secondary">Total Presupuestado</p>
                    <p className="text-2xl font-bold text-text-primary">{formatCurrency(totals.totalBudgeted)}</p>
                </div>
                <div className="bg-base-200 p-4 rounded-md">
                    <p className="text-sm text-text-secondary">Total Gastado</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(totals.totalSpent)}</p>
                </div>
                <div className="bg-base-200 p-4 rounded-md">
                    <p className="text-sm text-text-secondary">Ahorro Neto</p>
                    <p className={`text-2xl font-bold ${totals.netSaving >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(totals.netSaving)}</p>
                </div>
            </div>

            <div className="bg-base-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-base-300/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Subcategoría</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Presupuestado</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Gastado</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Diferencia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-300">
                            {reportData.map(item => (
                                <tr key={item.subcategory} className="hover:bg-base-300/40">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.subcategory}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{formatCurrency(item.budgeted)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 text-right">{formatCurrency(item.spent)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${item.difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(item.difference)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {reportData.length === 0 && <p className="text-center py-8 text-text-secondary">No hay datos para mostrar en el reporte.</p>}
            </div>
        </div>

        <div className="p-6 border-t border-base-300 flex flex-wrap justify-between items-center gap-4">
            <button 
              type="button" 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-base-300 rounded-md hover:bg-slate-600"
            >
                <DocumentArrowUpIcon className="h-5 w-5" />
                Exportar a CSV
            </button>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-base-300 rounded-md hover:bg-slate-600">Cerrar</button>
                <button 
                    type="button" 
                    onClick={onConfirmNewCycle}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-indigo-500"
                >
                    Finalizar y Empezar Nuevo Ciclo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CycleReportModal;