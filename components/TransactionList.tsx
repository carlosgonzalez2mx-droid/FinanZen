
import React from 'react';
import type { Transaction } from '../types';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Transacciones Recientes</h2>
      {sortedTransactions.length === 0 ? (
        <p className="text-text-secondary text-center py-8">No hay transacciones todavía. ¡Añade tu primer gasto!</p>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;