import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseClient';
import type { Transaction } from '../types';
import type { User } from 'firebase/auth';
import { useNotification } from '../contexts/ErrorContext';

export const useTransactions = (user: User | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { showNotification } = useNotification();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const transQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.uid)
      );
      const transSnap = await getDocs(transQuery);
      const transactionsList = transSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      // Ordenar por fecha en el cliente (más reciente primero)
      transactionsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(transactionsList);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('Error al cargar las transacciones', 'error');
    }
  }, [user, showNotification]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const newTransaction = {
        ...transaction,
        created_at: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
      setTransactions(prev => [{ ...newTransaction, id: docRef.id }, ...prev]);
      showNotification('Gasto añadido exitosamente', 'success');
    } catch (error) {
      console.error('Error adding transaction:', error);
      showNotification('Error al añadir el gasto. Por favor, intenta de nuevo.', 'error');
      throw error;
    }
  }, [user, showNotification]);

  const clearAllTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(collection(db, 'transactions'), where('user_id', '==', user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setTransactions([]);
      showNotification('Todas las transacciones han sido eliminadas', 'success');
    } catch (error) {
      console.error('Error clearing transactions:', error);
      showNotification('Error al eliminar las transacciones', 'error');
      throw error;
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    totalExpenses,
    addTransaction,
    clearAllTransactions,
    refetchTransactions: fetchTransactions
  };
};
