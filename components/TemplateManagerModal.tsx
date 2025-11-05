import React, { useState } from 'react';
import type { BudgetTemplate } from '../types';
import { XMarkIcon, SaveIcon, TrashIcon } from './Icons';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: BudgetTemplate[];
  onSave: (name: string, overwrite: boolean) => void;
  onLoad: (templateName: string) => void;
  onDelete: (templateName: string) => void;
}

const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSave,
  onLoad,
  onDelete,
}) => {
  const [newTemplateName, setNewTemplateName] = useState('');

  if (!isOpen) return null;

  const handleSaveClick = () => {
    onSave(newTemplateName, false);
    setNewTemplateName('');
  };

  const handleOverwrite = (name: string) => {
    if (window.confirm(`¿Estás seguro de que quieres sobrescribir la plantilla "${name}" con tu presupuesto actual?`)) {
        onSave(name, true);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-base-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">Administrar Plantillas de Presupuesto</h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-1">Guarda, carga o elimina tus configuraciones de presupuesto.</p>
        </div>
        
        <div className="p-6 space-y-4">
            <h3 className="text-md font-semibold text-text-primary">Guardar Presupuesto Actual</h3>
            <div className="flex items-center gap-2">
                <input 
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Nombre de la nueva plantilla"
                    className="flex-grow bg-base-300 border-transparent text-text-primary rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50"
                />
                <button 
                    onClick={handleSaveClick}
                    disabled={!newTemplateName.trim()}
                    className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-500 disabled:bg-indigo-300 disabled:opacity-50"
                >
                    <SaveIcon className="h-5 w-5" />
                    Guardar
                </button>
            </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto border-t border-base-300">
          <h3 className="text-md font-semibold text-text-primary mb-4">Plantillas Guardadas</h3>
          {templates.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No tienes plantillas guardadas.</p>
          ) : (
            <div className="space-y-3">
              {templates.map(template => (
                <div key={template.name} className="bg-base-200 p-3 rounded-md flex justify-between items-center">
                  <span className="font-medium text-text-primary">{template.name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onLoad(template.name)} className="px-3 py-1 text-sm text-white bg-brand-secondary rounded-md hover:bg-emerald-500">Cargar</button>
                    <button onClick={() => handleOverwrite(template.name)} className="px-3 py-1 text-sm text-text-primary bg-base-300 rounded-md hover:bg-slate-600">Sobrescribir</button>
                    <button onClick={() => onDelete(template.name)} className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-900/50">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-base-300 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-base-300 rounded-md hover:bg-slate-600">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default TemplateManagerModal;