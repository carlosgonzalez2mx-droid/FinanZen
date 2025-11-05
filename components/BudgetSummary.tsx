
import React from 'react';

interface BudgetSummaryProps {
  budgetPlan: Record<string, number>;
  totalExpenses: number;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgetPlan, totalExpenses }) => {
  
  const totalBudgeted = React.useMemo(() => {
    // Fix: Add explicit types to the reduce function to prevent type inference issues.
    return Object.values(budgetPlan).reduce((sum: number, value: number) => sum + value, 0);
  }, [budgetPlan]);

  const remaining = totalBudgeted - totalExpenses;
  const percentage = totalBudgeted > 0 ? (totalExpenses / totalBudgeted) * 100 : 0;
  
  const progressBarColor =
    percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-brand-secondary';

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Resumen Mensual</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-base-200 p-4 rounded-md">
          <p className="text-sm text-text-secondary">Presupuesto</p>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="bg-base-200 p-4 rounded-md">
          <p className="text-sm text-text-secondary">Gastado</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-base-200 p-4 rounded-md">
          <p className="text-sm text-text-secondary">Restante</p>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(remaining)}</p>
        </div>
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>Progreso</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2.5">
          <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;