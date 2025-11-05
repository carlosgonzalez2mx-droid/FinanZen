import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface ErrorContextType {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    duration: number = 5000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const notification: Notification = { id, type, message, duration };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <ErrorContext.Provider value={{ showNotification, notifications, removeNotification }}>
      {children}
    </ErrorContext.Provider>
  );
};
