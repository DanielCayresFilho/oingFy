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

export const getCategoryLabel = (category: string | TransactionCategory): string => {
  // Se a categoria já é um nome legível (string do banco), retorna direto
  if (typeof category === 'string' && !['salary', 'freelance', 'investment', 'food', 'transport', 'utilities', 'entertainment', 'health', 'education', 'shopping', 'subscription', 'rent', 'credit_card', 'other'].includes(category)) {
    return category;
  }

  // Mapeamento para categorias antigas (compatibilidade)
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
  return labels[category as TransactionCategory] || category;
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

export const getCategoryIcon = (category: string | TransactionCategory): string => {
  // Mapeamento de ícones baseado em palavras-chave do nome da categoria
  const categoryLower = category.toLowerCase();

  // Tentar mapear por palavras-chave no nome
  if (categoryLower.includes('salário') || categoryLower.includes('salario')) return '💰';
  if (categoryLower.includes('freelance') || categoryLower.includes('freela')) return '💻';
  if (categoryLower.includes('investimento')) return '📈';
  if (categoryLower.includes('alimenta') || categoryLower.includes('comida') || categoryLower.includes('restaurante')) return '🍔';
  if (categoryLower.includes('transporte') || categoryLower.includes('uber') || categoryLower.includes('combustível') || categoryLower.includes('combustivel')) return '🚗';
  if (categoryLower.includes('conta') || categoryLower.includes('luz') || categoryLower.includes('água') || categoryLower.includes('agua') || categoryLower.includes('internet')) return '⚡';
  if (categoryLower.includes('lazer') || categoryLower.includes('entretenimento') || categoryLower.includes('diversão') || categoryLower.includes('diversao')) return '🎮';
  if (categoryLower.includes('saúde') || categoryLower.includes('saude') || categoryLower.includes('médico') || categoryLower.includes('medico') || categoryLower.includes('farmácia') || categoryLower.includes('farmacia')) return '🏥';
  if (categoryLower.includes('educação') || categoryLower.includes('educacao') || categoryLower.includes('curso') || categoryLower.includes('escola')) return '📚';
  if (categoryLower.includes('compra') || categoryLower.includes('shopping')) return '🛍️';
  if (categoryLower.includes('assinatura') || categoryLower.includes('streaming') || categoryLower.includes('netflix')) return '📺';
  if (categoryLower.includes('moradia') || categoryLower.includes('aluguel') || categoryLower.includes('casa')) return '🏠';
  if (categoryLower.includes('cartão') || categoryLower.includes('cartao') || categoryLower.includes('crédito') || categoryLower.includes('credito')) return '💳';

  // Mapeamento para categorias antigas (compatibilidade)
  const icons: Record<string, string> = {
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

  return icons[category] || '📋'; // Retorna ícone padrão se não encontrar
};
