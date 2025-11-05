import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon, CheckIcon } from './Icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all opacity-100 scale-100">
        <div className="p-6 text-center border-b border-base-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
             <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Desbloquea FinanZen Pro</h2>
          <p className="text-sm text-text-secondary mt-1">Obtén acceso a funciones exclusivas para potenciar tus finanzas.</p>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <ul className="space-y-3 text-text-primary">
                <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-brand-secondary mr-3 flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Análisis de Recibos con IA:</span> Ahorra tiempo capturando tus gastos automáticamente desde una foto.</span>
                </li>
                <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-brand-secondary mr-3 flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Importación de Presupuestos PDF:</span> Carga tu plan financiero desde un archivo con un solo clic.</span>
                </li>
                <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-brand-secondary mr-3 flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Reportes Avanzados:</span> Exporta y analiza tus datos financieros con reportes detallados.</span>
                </li>
                 <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-brand-secondary mr-3 flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Soporte Prioritario:</span> Recibe ayuda de nuestro equipo cuando la necesites.</span>
                </li>
            </ul>

            <div className="space-y-4">
                 <button 
                    onClick={() => setSelectedPlan('yearly')}
                    className={`w-full p-4 border-2 rounded-lg text-left relative transition-colors ${selectedPlan === 'yearly' ? 'border-brand-primary bg-indigo-900/30' : 'border-base-300 hover:border-slate-500'}`}
                 >
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">-20% AHORRO</span>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg text-text-primary">Plan Anual</span>
                        <div>
                            <span className="text-2xl font-bold text-text-primary">$999.00</span>
                            <span className="text-text-secondary"> / año</span>
                        </div>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">$83.25 al mes</p>
                </button>
                <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPlan === 'monthly' ? 'border-brand-primary bg-indigo-900/30' : 'border-base-300 hover:border-slate-500'}`}
                >
                     <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg text-text-primary">Plan Mensual</span>
                        <div>
                            <span className="text-2xl font-bold text-text-primary">$100.00</span>
                            <span className="text-text-secondary"> / mes</span>
                        </div>
                    </div>
                </button>
            </div>
            
            <p className="text-xs text-text-secondary text-center">
                Las suscripciones se renuevan automáticamente. Puedes cancelar en cualquier momento desde la configuración de tu cuenta de la App Store.
            </p>
        </div>

        <div className="p-6 border-t border-base-300 space-y-3">
            <button 
                type="button" 
                onClick={onSubscribe}
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
                Suscribirse Ahora
            </button>
            <button 
                type="button" 
                onClick={onClose} 
                className="w-full px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
                Ahora no
            </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;
