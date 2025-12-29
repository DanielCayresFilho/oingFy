import { Transaction, CreditCard, MonthSummary } from '@/types/finance';

export const mockCreditCards: CreditCard[] = [
  {
    id: '1',
    name: 'Nubank',
    limit: 5000,
    used: 1850.50,
    dueDay: 15,
    color: '#8B5CF6'
  },
  {
    id: '2', 
    name: 'Inter',
    limit: 3000,
    used: 890.00,
    dueDay: 10,
    color: '#F97316'
  },
  {
    id: '3',
    name: 'C6 Bank',
    limit: 2500,
    used: 450.00,
    dueDay: 20,
    color: '#1A1A1A'
  }
];

export const mockTransactions: Transaction[] = [
  // Entradas
  {
    id: '1',
    description: 'Salário',
    amount: 8500.00,
    dueDate: '2025-01-05',
    paidDate: '2025-01-05',
    status: 'paid',
    type: 'income',
    category: 'salary',
    isRecurring: true,
  },
  {
    id: '2',
    description: 'Freelance - Projeto Web',
    amount: 2500.00,
    dueDate: '2025-01-15',
    status: 'pending',
    type: 'income',
    category: 'freelance',
    isRecurring: false,
  },
  // Gastos Fixos
  {
    id: '3',
    description: 'Aluguel',
    amount: -2200.00,
    dueDate: '2025-01-10',
    paidDate: '2025-01-08',
    status: 'early',
    type: 'expense',
    category: 'rent',
    isRecurring: true,
  },
  {
    id: '4',
    description: 'Energia Elétrica',
    amount: -280.00,
    dueDate: '2025-01-12',
    paidDate: '2025-01-12',
    status: 'paid',
    type: 'expense',
    category: 'utilities',
    isRecurring: true,
  },
  {
    id: '5',
    description: 'Internet',
    amount: -149.90,
    dueDate: '2025-01-15',
    status: 'pending',
    type: 'expense',
    category: 'utilities',
    isRecurring: true,
  },
  {
    id: '6',
    description: 'Plano de Saúde',
    amount: -450.00,
    dueDate: '2025-01-05',
    paidDate: '2025-01-05',
    status: 'paid',
    type: 'expense',
    category: 'health',
    isRecurring: true,
  },
  // Gastos Variáveis
  {
    id: '7',
    description: 'Supermercado',
    amount: -620.00,
    dueDate: '2025-01-08',
    paidDate: '2025-01-08',
    status: 'paid',
    type: 'expense',
    category: 'food',
    isRecurring: false,
  },
  {
    id: '8',
    description: 'Uber - Corridas',
    amount: -180.00,
    dueDate: '2025-01-20',
    status: 'pending',
    type: 'expense',
    category: 'transport',
    isRecurring: false,
  },
  {
    id: '9',
    description: 'iFood - Dezembro',
    amount: -350.00,
    dueDate: '2025-01-03',
    status: 'overdue',
    type: 'expense',
    category: 'food',
    isRecurring: false,
  },
  // Crédito
  {
    id: '10',
    description: 'Fatura Nubank',
    amount: -1850.50,
    dueDate: '2025-01-15',
    status: 'pending',
    type: 'credit',
    category: 'credit_card',
    isRecurring: true,
    cardName: 'Nubank',
  },
  {
    id: '11',
    description: 'Fatura Inter',
    amount: -890.00,
    dueDate: '2025-01-10',
    paidDate: '2025-01-10',
    status: 'paid',
    type: 'credit',
    category: 'credit_card',
    isRecurring: true,
    cardName: 'Inter',
  },
  {
    id: '12',
    description: 'Fatura C6 Bank',
    amount: -450.00,
    dueDate: '2025-01-20',
    status: 'pending',
    type: 'credit',
    category: 'credit_card',
    isRecurring: true,
    cardName: 'C6 Bank',
  },
  // Assinaturas
  {
    id: '13',
    description: 'Netflix',
    amount: -55.90,
    dueDate: '2025-01-22',
    status: 'pending',
    type: 'expense',
    category: 'subscription',
    isRecurring: true,
  },
  {
    id: '14',
    description: 'Spotify',
    amount: -21.90,
    dueDate: '2025-01-18',
    status: 'pending',
    type: 'expense',
    category: 'subscription',
    isRecurring: true,
  },
  {
    id: '15',
    description: 'Academia',
    amount: -99.00,
    dueDate: '2025-01-05',
    paidDate: '2025-01-05',
    status: 'paid',
    type: 'expense',
    category: 'health',
    isRecurring: true,
  },
];

export const calculateMonthSummary = (transactions: Transaction[], creditCards: CreditCard[]): MonthSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const paidCredit = transactions
    .filter(t => t.type === 'credit' && t.status === 'paid')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalLimit = creditCards.reduce((sum, c) => sum + c.limit, 0);
  const totalUsed = creditCards.reduce((sum, c) => sum + c.used, 0);
  const availableCredit = totalLimit - totalUsed + paidCredit;

  const balance = totalIncome - totalExpenses - totalCredit;

  const paidCount = transactions.filter(t => t.status === 'paid' || t.status === 'early').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const overdueCount = transactions.filter(t => t.status === 'overdue').length;

  return {
    balance,
    totalIncome,
    totalExpenses,
    totalCredit,
    availableCredit,
    paidCount,
    pendingCount,
    overdueCount,
  };
};
