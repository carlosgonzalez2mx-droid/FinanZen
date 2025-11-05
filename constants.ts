// Fix: Removed import from './types' to break circular dependency.
// import type { BudgetCategory, PaymentMethod } from './types';

// Se cambió el nombre a INITIAL_BUDGET_CATEGORIES para reflejar que es solo el estado inicial
export const INITIAL_BUDGET_CATEGORIES = [
  {
    name: 'VIVIENDA',
    subcategories: ['Renta', 'Hipoteca', 'Impuestos a la vivienda', 'Reparaciones / mantenimiento', 'Otros costos de vivienda'],
  },
  {
    name: 'ALIMENTACIÓN',
    subcategories: ['Despensa', 'Restaurantes'],
  },
  {
    name: 'IMPUESTOS Y DONACIONES',
    subcategories: ['Impuesto sobre la renta', 'Otros impuestos', 'Donaciones'],
  },
  {
    name: 'TRANSPORTE',
    subcategories: ['Gasolina y fluidos', 'Reparaciones y llantas', 'Licencia e impuestos', 'Estacionamiento y casetas', 'Vuelos', 'Renta de vehículos', 'Transporte público'],
  },
  {
    name: 'SEGUROS',
    subcategories: ['Vida', 'Gastos médicos', 'Hogar', 'Discapacidad', 'Robo', 'Cuidado en la vejez', 'Otros seguros'],
  },
  {
    name: 'AHORROS',
    subcategories: ['Fondo de emergencias', 'Fondo para el retiro', 'Fondo para la educación', 'Otro ahorro 1', 'Otro ahorro 2', 'Otro ahorro 3'],
  },
  {
    name: 'SALUD',
    subcategories: ['Medicamentos', 'Doctores', 'Dentistas', 'Oculistas', 'Suministros médicos', 'Vitaminas', 'Otros gastos de salud'],
  },
  {
    name: 'SERVICIOS',
    subcategories: ['Electricidad', 'Gas', 'Agua', 'Recolección de residuos', 'Celular', 'Internet', 'Televisión por cable', 'Seguridad'],
  },
  {
    name: 'RECREACIÓN',
    subcategories: ['Suscripciones de video', 'Suscripciones de audio', 'Entradas a eventos', 'Entradas a atracciones', 'Paquetes de viajes', 'Hospedaje'],
  },
  {
    name: 'VESTIMENTA',
    subcategories: ['Ropa adultos', 'Ropa niños', 'Zapatos adultos', 'Zapatos niños', 'Cuidado y limpieza'],
  },
  {
    name: 'DEUDAS',
    subcategories: ['Créditos automotrices', 'Créditos personales', 'Tarjetas de crédito', 'Anualidades de tarjetas de crédito', 'Comisiones', 'Otras deudas'],
  },
  {
    name: 'GASTOS PERSONALES',
    subcategories: ['Cuidado de niños', 'Artículos de aseo personal', 'Cosméticos y aseo de cabello', 'Colegiaturas / educación', 'Libros y útiles', 'Pensión alimenticia', 'Manutención de hijos', 'Costos de organización', 'Regalos', 'Reemplazo de muebles', 'Suministros para mascotas', 'Artículos de tecnología', 'Otros gastos personales'],
  },
] as const;


// Se ha renombrado para reflejar que son los valores iniciales de un estado mutable
export const INITIAL_PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta de Crédito A',
  'Tarjeta de Crédito B',
  'Cuenta de Banco',
];