import React from 'react';
import type { Transaction } from '../types';
import CategoryIcon from './CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { description, amount, date, category, subcategory } = transaction;

  const formatDate = (dateString: string) => {
    const event = new Date(dateString);
    event.setDate(event.getDate() + 1); // Adjust for timezone issues
    return event.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="flex items-center justify-between bg-base-200 p-4 rounded-lg hover:bg-base-300 transition-colors">
      <div className="flex items-center space-x-4">
        <CategoryIcon category={category} />
        <div>
          <p className="font-semibold text-text-primary">{description}</p>
          <p className="text-sm text-text-secondary">{subcategory} &middot; {formatDate(date)}</p>
        </div>
      </div>
      <div className="text-right">
         <p className="font-semibold text-red-400 text-lg">{formatCurrency(amount)}</p>
         <p className="text-sm text-text-secondary">{transaction.paymentMethod}</p>
      </div>
    </div>
  );
};

export default TransactionItem;