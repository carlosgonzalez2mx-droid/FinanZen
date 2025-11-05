
import React, { useState } from 'react';
import type { Investment } from '../types';
import { PlusCircleIcon } from './Icons';

interface InvestmentTrackerProps {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
}

const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({ investments, addInvestment }) => {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('GBM');
  const [amountInvested, setAmountInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amountInvested && currentValue) {
      addInvestment({
        name,
        platform,
        amountInvested: parseFloat(amountInvested),
        currentValue: parseFloat(currentValue),
      });
      setName('');
      setPlatform('GBM');
      setAmountInvested('');
      setCurrentValue('');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Resumen de Inversiones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-base-300 p-4 rounded-md">
            <p className="text-sm text-text-secondary">Total Invertido</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="bg-base-300 p-4 rounded-md">
            <p className="text-sm text-text-secondary">Valor Actual</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalCurrentValue)}</p>
          </div>
          <div className="bg-base-300 p-4 rounded-md">
            <p className="text-sm text-text-secondary">Ganancia / Pérdida</p>
            <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totalGainLoss)} ({gainLossPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-base-200 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Mis Inversiones</h3>
          {investments.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No has añadido ninguna inversión.</p>
          ) : (
            <div className="space-y-4">
              {investments.map(inv => (
                <div key={inv.id} className="bg-base-300 p-4 rounded-md grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="font-bold text-text-primary">{inv.name}</p>
                    <p className="text-sm text-text-secondary">{inv.platform}</p>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-sm text-text-secondary">Invertido</p>
                    <p>{formatCurrency(inv.amountInvested)}</p>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-sm text-text-secondary">Valor Actual</p>
                    <p>{formatCurrency(inv.currentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${inv.currentValue >= inv.amountInvested ? 'text-green-400' : 'text-red-400'}`}>
                      {(((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Añadir Inversión</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inv-name" className="block text-sm font-medium text-text-secondary">Nombre del Activo</label>
              <input type="text" id="inv-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label htmlFor="inv-platform" className="block text-sm font-medium text-text-secondary">Plataforma</label>
              <input type="text" id="inv-platform" value={platform} onChange={e => setPlatform(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
            </div>
            <div>
              <label htmlFor="inv-amount" className="block text-sm font-medium text-text-secondary">Monto Invertido</label>
              <input type="number" id="inv-amount" value={amountInvested} onChange={e => setAmountInvested(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
            </div>
             <div>
              <label htmlFor="inv-current" className="block text-sm font-medium text-text-secondary">Valor Actual</label>
              <input type="number" id="inv-current" value={currentValue} onChange={e => setCurrentValue(e.target.value)} required className="mt-1 block w-full bg-base-300 border-transparent rounded-md shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50" />
            </div>
            <button type="submit" className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-base-100">
              <PlusCircleIcon className="h-5 w-5" />
              Añadir Inversión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestmentTracker;
