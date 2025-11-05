
import React from 'react';
import type { Transaction, MutableBudgetCategory, MainCategory } from '../types';
import BudgetSummary from './BudgetSummary';
import TransactionList from './TransactionList';
import CategoryStatusList from './CategoryStatusList';

interface DashboardProps {
  transactions: Transaction[];
  totalExpenses: number;
  budgetCategories: MutableBudgetCategory[];
  budgetPlan: Record<string, number>;
  onSelectCategory: (category: MainCategory) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, totalExpenses, budgetCategories, budgetPlan, onSelectCategory }) => {
  return (
    <div className="space-y-8 bg-base-200">
      <BudgetSummary
        budgetPlan={budgetPlan}
        totalExpenses={totalExpenses}
      />
      <CategoryStatusList
        budgetCategories={budgetCategories}
        budgetPlan={budgetPlan}
        transactions={transactions}
        onSelectCategory={onSelectCategory}
      />
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Dashboard;