import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Iniciando listener de autenticación');
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('useAuth: Estado de autenticación cambió', user ? `Usuario: ${user.email}` : 'Sin usuario');
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('useAuth: Error de autenticación:', error);
        setLoading(false);
      }
    );
    return () => {
      console.log('useAuth: Limpiando listener de autenticación');
      unsubscribe();
    };
  }, []);

  return { user, loading };
};
