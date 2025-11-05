import React from 'react';
import type { CategoryStatus } from './CategoryStatusList';
import CategoryIcon from './CategoryIcon';
import { MainCategory } from '../types';

interface CategoryStatusItemProps {
  categoryStatus: CategoryStatus;
  onSelect: (category: MainCategory) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const CategoryStatusItem: React.FC<CategoryStatusItemProps> = ({ categoryStatus, onSelect }) => {
  const { name, totalBudgeted, totalSpent } = categoryStatus;

  const percentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  let progressBarColor = 'bg-brand-secondary';
  let textColor = 'text-text-primary';
  
  if (percentage >= 90) {
    progressBarColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage >= 70) {
    progressBarColor = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  }

  return (
    <button
      onClick={() => onSelect(name)}
      className="bg-base-200 p-4 rounded-lg flex flex-col justify-between space-y-3 w-full text-left hover:bg-base-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <CategoryIcon category={name} />
            <span className="font-semibold text-text-primary">{name}</span>
        </div>
        <span className={`font-bold ${textColor}`}>{percentage.toFixed(0)}%</span>
      </div>

      <div>
         <div className="flex justify-between text-sm text-text-secondary mb-1">
            <span>{formatCurrency(totalSpent)}</span>
            <span>{formatCurrency(totalBudgeted)}</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2.5">
          <div
            className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </button>
  );
};

export default CategoryStatusItem;