import { TransactionCategory, TransactionStatus } from '@/types/finance';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const formatFullDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const getCategoryLabel = (category: TransactionCategory): string => {
  const labels: Record<TransactionCategory, string> = {
    salary: 'Salário',
    freelance: 'Freelance',
    investment: 'Investimento',
    food: 'Alimentação',
    transport: 'Transporte',
    utilities: 'Contas',
    entertainment: 'Lazer',
    health: 'Saúde',
    education: 'Educação',
    shopping: 'Compras',
    subscription: 'Assinatura',
    rent: 'Moradia',
    credit_card: 'Cartão',
    other: 'Outros',
  };
  return labels[category];
};

export const getStatusLabel = (status: TransactionStatus): string => {
  const labels: Record<TransactionStatus, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    overdue: 'Atrasado',
    early: 'Adiantado',
  };
  return labels[status];
};

export const getCategoryIcon = (category: TransactionCategory): string => {
  const icons: Record<TransactionCategory, string> = {
    salary: '💰',
    freelance: '💻',
    investment: '📈',
    food: '🍔',
    transport: '🚗',
    utilities: '⚡',
    entertainment: '🎮',
    health: '🏥',
    education: '📚',
    shopping: '🛍️',
    subscription: '📺',
    rent: '🏠',
    credit_card: '💳',
    other: '📋',
  };
  return icons[category];
};
