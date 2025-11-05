import React, { useState } from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from './Icons';

interface AccountsPageProps {
  paymentMethods: string[];
  onAddPaymentMethod: (name: string) => boolean;
  onUpdatePaymentMethod: (oldName: string, newName: string) => boolean;
  onDeletePaymentMethod: (name: string) => void;
}

const AccountsPage: React.FC<AccountsPageProps> = ({ paymentMethods, onAddPaymentMethod, onUpdatePaymentMethod, onDeletePaymentMethod }) => {
  const [newMethodName, setNewMethodName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (newMethodName.trim()) {
      const success = onAddPaymentMethod(newMethodName.trim());
      if (success) {
        setNewMethodName('');
      }
    }
  };

  const startEditing = (name: string) => {
    setEditingName(name);
    setEditingValue(name);
  };

  const cancelEditing = () => {
    setEditingName(null);
    setEditingValue('');
  };

  const handleUpdate = () => {
    if (editingName && editingValue.trim()) {
      const success = onUpdatePaymentMethod(editingName, editingValue.trim());
      if (success) {
        cancelEditing();
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-text-primary">Administrar Cuentas</h2>
        <p className="text-text-secondary mt-1">Añade, edita o elimina tus métodos de pago.</p>
      </div>

      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Añadir Nueva Cuenta</h3>
        <div className="flex items-center gap-2">
            <input 
                type="text"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Ej: Tarjeta de Vales, PayPal..."
                className="flex-grow bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50"
            />
            <button 
                onClick={handleAdd}
                disabled={!newMethodName.trim()}
                className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-500 disabled:bg-indigo-300 disabled:opacity-50"
            >
                <PlusCircleIcon className="h-5 w-5" />
                Añadir
            </button>
        </div>
      </div>

      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Mis Cuentas</h3>
        <div className="space-y-3">
          {paymentMethods.length > 0 ? (
            paymentMethods.map(method => (
              <div key={method} className="bg-base-200 p-3 rounded-md flex justify-between items-center group">
                {editingName === method ? (
                   <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        className="flex-grow bg-base-300 text-text-primary border-brand-primary border rounded-md shadow-sm"
                        autoFocus
                    />
                ) : (
                  <span className="font-medium text-text-primary">{method}</span>
                )}
                
                <div className="flex items-center gap-2">
                  {editingName === method ? (
                    <>
                      <button onClick={handleUpdate} className="text-green-400 hover:text-green-300 p-1">
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button onClick={cancelEditing} className="text-red-400 hover:text-red-300 p-1">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(method)} className="text-text-secondary hover:text-text-primary p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDeletePaymentMethod(method)} className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
             <p className="text-text-secondary text-center py-8">No has añadido ninguna cuenta o método de pago.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;