import React from 'react';
import type { View } from '../types';
import { ChartPieIcon, CreditCardIcon, WalletIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const NavButton: React.FC<{
    viewName: View;
    label: string;
    icon: React.ReactNode;
  }> = ({ viewName, label, icon }) => {
    const isActive = currentView === viewName;
    return (
      <button
        onClick={() => setView(viewName)}
        aria-label={label}
        className={`flex items-center space-x-0 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-primary text-white'
            : 'text-text-secondary hover:bg-base-300 hover:text-text-primary'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <header className="bg-base-100 border-b border-base-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-text-primary">FinanZen</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NavButton viewName="dashboard" label="Dashboard" icon={<ChartPieIcon className="h-5 w-5" />} />
            <NavButton viewName="budget" label="Presupuesto" icon={<WalletIcon className="h-5 w-5" />} />
            <NavButton viewName="accounts" label="Cuentas" icon={<CreditCardIcon className="h-5 w-5" />} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;