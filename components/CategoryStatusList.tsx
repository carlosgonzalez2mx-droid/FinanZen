import React, { useMemo } from 'react';
import type { Transaction, MutableBudgetCategory, MainCategory } from '../types';
import CategoryStatusItem from './CategoryStatusItem';

interface CategoryStatusListProps {
  budgetCategories: MutableBudgetCategory[];
  budgetPlan: Record<string, number>;
  transactions: Transaction[];
  onSelectCategory: (category: MainCategory) => void;
}

export interface CategoryStatus {
  name: MainCategory;
  totalBudgeted: number;
  totalSpent: number;
}

const CategoryStatusList: React.FC<CategoryStatusListProps> = ({ budgetCategories, budgetPlan, transactions, onSelectCategory }) => {
  const categoryData: CategoryStatus[] = useMemo(() => {
    return budgetCategories.map(category => {
      const totalBudgeted = category.subcategories.reduce(
        (sum, sub) => sum + (budgetPlan[sub] || 0),
        0
      );
      const totalSpent = transactions
        .filter(t => t.category === category.name)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: category.name,
        totalBudgeted,
        totalSpent,
      };
    }).filter(cat => cat.totalBudgeted > 0 || cat.totalSpent > 0);
  }, [budgetCategories, budgetPlan, transactions]);

  if (categoryData.length === 0) {
    return null;
  }

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Estado por Categoría</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryData.map(data => (
          <CategoryStatusItem key={data.name} categoryStatus={data} onSelect={onSelectCategory} />
        ))}
      </div>
    </div>
  );
};

export default CategoryStatusList;