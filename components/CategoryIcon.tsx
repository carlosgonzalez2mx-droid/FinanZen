import React from 'react';
import type { MainCategory } from '../types';
import {
  HomeIcon,
  CakeIcon,
  ReceiptPercentIcon,
  TruckIcon,
  ShieldCheckIcon,
  PiggyBankIcon,
  HeartPulseIcon,
  BoltIcon,
  TicketIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  UserIcon,
  ChartPieIcon
} from './Icons';

interface CategoryIconProps {
  category: MainCategory;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category }) => {
  const iconMap: Record<MainCategory, React.ReactNode> = {
    'VIVIENDA': <HomeIcon className="h-6 w-6" />,
    'ALIMENTACIÓN': <CakeIcon className="h-6 w-6" />,
    'IMPUESTOS Y DONACIONES': <ReceiptPercentIcon className="h-6 w-6" />,
    'TRANSPORTE': <TruckIcon className="h-6 w-6" />,
    'SEGUROS': <ShieldCheckIcon className="h-6 w-6" />,
    'AHORROS': <PiggyBankIcon className="h-6 w-6" />,
    'SALUD': <HeartPulseIcon className="h-6 w-6" />,
    'SERVICIOS': <BoltIcon className="h-6 w-6" />,
    'RECREACIÓN': <TicketIcon className="h-6 w-6" />,
    'VESTIMENTA': <ShoppingBagIcon className="h-6 w-6" />,
    'DEUDAS': <CreditCardIcon className="h-6 w-6" />,
    'GASTOS PERSONALES': <UserIcon className="h-6 w-6" />,
  };

  const colorMap: Record<MainCategory, string> = {
    'VIVIENDA': 'bg-orange-500',
    'ALIMENTACIÓN': 'bg-green-500',
    'IMPUESTOS Y DONACIONES': 'bg-gray-500',
    'TRANSPORTE': 'bg-blue-500',
    'SEGUROS': 'bg-sky-500',
    'AHORROS': 'bg-teal-500',
    'SALUD': 'bg-red-500',
    'SERVICIOS': 'bg-yellow-500',
    'RECREACIÓN': 'bg-pink-500',
    'VESTIMENTA': 'bg-purple-500',
    'DEUDAS': 'bg-rose-500',
    'GASTOS PERSONALES': 'bg-indigo-500',
  };

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${colorMap[category] || 'bg-gray-500'}`}>
      {iconMap[category] || <ChartPieIcon className="h-6 w-6" />}
    </div>
  );
};

export default CategoryIcon;
