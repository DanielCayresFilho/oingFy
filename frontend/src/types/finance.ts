export type TransactionStatus = 'paid' | 'pending' | 'overdue' | 'early';
export type TransactionType = 'income' | 'expense' | 'credit';
export type TransactionCategory = 
  | 'salary' 
  | 'freelance' 
  | 'investment'
  | 'food' 
  | 'transport' 
  | 'utilities' 
  | 'entertainment' 
  | 'health' 
  | 'education'
  | 'shopping'
  | 'subscription'
  | 'rent'
  | 'credit_card'
  | 'other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: TransactionStatus;
  type: TransactionType;
  category: TransactionCategory;
  isRecurring: boolean;
  origin?: string; // Nome do cartão ou tipo da conta (Conta Fixa, Conta Variável)
  cardName?: string; // Deprecated - usar 'origin'
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  used: number;
  dueDay: number;
  color: string;
}

export interface MonthSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalCredit: number;
  availableCredit: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface FilterState {
  month: string;
  status: TransactionStatus | 'all';
  category: TransactionCategory | 'all';
  type: TransactionType | 'all';
  search: string;
}
