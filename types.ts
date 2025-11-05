
// Fix: Changed import type to value import to be used for type derivation.
import { INITIAL_BUDGET_CATEGORIES } from "./constants";

export type MainCategory = typeof INITIAL_BUDGET_CATEGORIES[number]['name'];

export type PaymentMethod = string;

// Fix: Replaced interface with a derived type to break circular dependency.
export type BudgetCategory = typeof INITIAL_BUDGET_CATEGORIES[number];

// Nueva interfaz para manejar categorías y subcategorías mutables en el estado de React
export interface MutableBudgetCategory {
  readonly name: MainCategory;
  subcategories: string[];
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category: MainCategory;
  subcategory: string;
  paymentMethod: PaymentMethod;
  created_at: string;
}

export type View = 'dashboard' | 'accounts' | 'budget';

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: MainCategory;
  subcategory: string;
}

export interface BudgetTemplate {
  id: string;
  user_id: string;
  name: string;
  plan: Record<string, number>;
  categories: MutableBudgetCategory[];
  created_at: string;
}

export interface CategoryDetailData {
  name: MainCategory;
  subcategories: string[];
  transactions: Transaction[];
  budgetPlan: Record<string, number>;
}

// Fix: Add missing Investment type definition.
export interface Investment {
  id: string;
  name: string;
  platform: string;
  amountInvested: number;
  currentValue: number;
}

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  is_subscribed: boolean;
  trial_ends_at: string;
}
