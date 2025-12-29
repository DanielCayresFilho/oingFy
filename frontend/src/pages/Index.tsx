import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { CreditOverview } from '@/components/dashboard/CreditOverview';
import { TransactionFilters } from '@/components/dashboard/TransactionFilters';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { StatusSummary } from '@/components/dashboard/StatusSummary';
import { formatCurrency, getMonthName } from '@/lib/formatters';
import { FilterState, Transaction, TransactionStatus, MonthSummary } from '@/types/finance';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { monthMovimentationApi, reportsApi, moneyEntriesApi, creditCardsApi, CreditCardsSummary } from '@/lib/api';
import { MonthMovimentationItem, PaymentStatus, AccountType, MoneyEntry } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Função para converter MonthMovimentationItem para Transaction
function convertItemToTransaction(item: MonthMovimentationItem): Transaction {
  const statusMap: Record<PaymentStatus, TransactionStatus> = {
    PAID: 'paid',
    PENDING: 'pending',
    OVERDUE: 'overdue',
    ADVANCED: 'early',
  };

  const typeMap: Record<AccountType, 'income' | 'expense' | 'credit'> = {
    FIXED: 'expense',
    VARIABLE: 'expense',
    CREDIT: 'credit',
  };

  return {
    id: item.id.toString(),
    description: item.accountName,
    amount: item.accountType === 'CREDIT' ? -Number(item.amount) : -Number(item.amount),
    dueDate: item.dueDate.split('T')[0],
    paidDate: item.paidAt ? item.paidAt.split('T')[0] : undefined,
    status: statusMap[item.status],
    type: typeMap[item.accountType],
    category: 'other' as any, // Poderia mapear categoria se necessário
    isRecurring: item.accountType === 'FIXED',
  };
}

// Função para converter CreditCardsSummary para CreditCard do tipo finance
function convertCardSummaryToCard(card: CreditCardsSummary, creditCard: any, index: number): any {
  const colors = ['#8B5CF6', '#F97316', '#1A1A1A', '#10B981', '#3B82F6'];
  const dueDate = creditCard?.vencibleAt ? new Date(creditCard.vencibleAt) : new Date();
  return {
    id: card.id.toString(),
    name: card.name,
    limit: card.totalLimit,
    used: card.usedLimit,
    dueDay: dueDate.getDate(),
    color: colors[index % colors.length],
  };
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inicializar com o mês atual
  const initialDate = new Date();
  const currentMonthString = format(initialDate, 'yyyy-MM');
  
  const [filters, setFilters] = useState<FilterState>({
    month: currentMonthString,
    status: 'all',
    category: 'all',
    type: 'all',
    search: '',
  });

  const currentDate = useMemo(() => {
    const [year, month] = filters.month.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }, [filters.month]);

  const currentMonth = getMonthName(currentDate);

  const loadData = async () => {
    try {
      setLoading(true);
      const [year, month] = filters.month.split('-').map(Number);

      // Carregar movimentação mensal
      let movimentation = null;
      try {
        movimentation = await monthMovimentationApi.findByMonth(month, year);
      } catch (error: any) {
        // Se não encontrar, vai gerar abaixo
        console.log('Movimentação não encontrada, gerando...');
      }

      // Se não existir, gerar (sempre gerar para garantir que temos dados atualizados)
      if (!movimentation || !movimentation.items || movimentation.items.length === 0) {
        try {
          console.log(`Gerando movimentação para ${month}/${year}...`);
          movimentation = await monthMovimentationApi.generate(month, year);
          console.log('Movimentação gerada:', movimentation);
        } catch (error: any) {
          console.error('Erro ao gerar movimentação:', error);
          toast.error('Erro ao gerar movimentação mensal: ' + (error.response?.data?.message || error.message));
          // Continuar mesmo com erro para mostrar dados existentes
          if (!movimentation) {
            movimentation = { items: [] };
          }
        }
      }

      // Carregar entradas de dinheiro do mês
      const moneyEntries = await moneyEntriesApi.findByMonth(month, year);
      
      // Converter entradas de dinheiro para transactions (income)
      const incomeTransactions: Transaction[] = moneyEntries.map((entry: MoneyEntry) => ({
        id: `income-${entry.id}`,
        description: entry.name,
        amount: Number(entry.amount),
        dueDate: entry.entryDate.split('T')[0],
        paidDate: entry.entryDate.split('T')[0],
        status: 'paid' as TransactionStatus,
        type: 'income' as const,
        category: 'other' as any,
        isRecurring: false,
      }));

      // Converter items para transactions
      const items = movimentation?.items || [];
      const expenseTransactions = items.map(convertItemToTransaction);
      
      // Combinar todas as transações
      setTransactions([...incomeTransactions, ...expenseTransactions]);

      // Carregar resumo de cartões
      const [cardsSummary, cardsData] = await Promise.all([
        reportsApi.getCreditCardsSummary(),
        creditCardsApi.getAll(),
      ]);
      
      // Criar um mapa dos cartões por ID para buscar vencibleAt
      const cardsMap = new Map(cardsData.map(card => [card.id, card]));
      const convertedCards = cardsSummary.map((card, index) => {
        const cardData = cardsMap.get(card.id);
        return convertCardSummaryToCard(card, cardData, index);
      });
      setCreditCards(convertedCards);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.month]);


  const [summary, setSummary] = useState<MonthSummary>({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalCredit: 0,
    availableCredit: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
  });

  useEffect(() => {
    const loadSummary = async () => {
      const [year, month] = filters.month.split('-').map(Number);
      try {
        const financial = await reportsApi.getFinancialSummary(month, year);
        const cardsSummary = await reportsApi.getCreditCardsSummary();
        
        const totalCredit = cardsSummary.reduce((sum, card) => sum + card.usedLimit, 0);
        const totalLimit = cardsSummary.reduce((sum, card) => sum + card.totalLimit, 0);
        const availableCredit = totalLimit - totalCredit;

        const paidCount = transactions.filter(t => t.status === 'paid' || t.status === 'early').length;
        const pendingCount = transactions.filter(t => t.status === 'pending').length;
        const overdueCount = transactions.filter(t => t.status === 'overdue').length;

        setSummary({
          balance: Number(financial.balance),
          totalIncome: Number(financial.totalIncome),
          totalExpenses: Number(financial.totalExpenses),
          totalCredit,
          availableCredit,
          paidCount,
          pendingCount,
          overdueCount,
        });
      } catch (error) {
        console.error('Erro ao carregar resumo:', error);
      }
    };

    loadSummary();
  }, [filters.month, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filters]);

  const handleStatusChange = async (id: string, status: TransactionStatus) => {
    // Se for uma entrada de dinheiro (income), não fazer nada (já está paga)
    if (id.startsWith('income-')) {
      return;
    }
    
    const itemId = parseInt(id);
    
    try {
      if (status === 'paid' || status === 'early') {
        await monthMovimentationApi.payItem(itemId);
      } else if (status === 'pending' || status === 'overdue') {
        await monthMovimentationApi.unpayItem(itemId);
      }
      
      // Recarregar dados para atualizar cálculos
      await loadData();
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Dados do gráfico (simplificado - pode ser melhorado com dados reais de semanas)
  const chartData = useMemo(() => {
    const [year, month] = filters.month.split('-').map(Number);
    const weeks = [
      { name: 'Sem 1', income: 0, expense: 0 },
      { name: 'Sem 2', income: 0, expense: 0 },
      { name: 'Sem 3', income: 0, expense: 0 },
      { name: 'Sem 4', income: 0, expense: 0 },
    ];

    // Distribuir transactions por semana (simplificado)
    transactions.forEach((t) => {
      const date = new Date(t.dueDate);
      const week = Math.floor((date.getDate() - 1) / 7);
      if (week >= 0 && week < 4) {
        if (t.type === 'income') {
          weeks[week].income += Math.abs(t.amount);
        } else {
          weeks[week].expense += Math.abs(t.amount);
        }
      }
    });

    return weeks;
  }, [transactions, filters.month]);

  if (loading) {
    return (
      <Layout currentMonth={currentDate}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentMonth={currentDate}>
      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-semibold mb-1">
            Movimentação do Mês
          </h1>
          <p className="text-muted-foreground">
            Controle total das suas finanças
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Saldo Disponível"
            value={formatCurrency(summary.balance)}
            subtitle="Após todos os pagamentos"
            icon={<Wallet className="h-5 w-5 text-primary" />}
            variant={summary.balance >= 0 ? 'income' : 'expense'}
          />
          <SummaryCard
            title="Entradas"
            value={formatCurrency(summary.totalIncome)}
            subtitle={`${transactions.filter(t => t.type === 'income').length} transações`}
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            variant="income"
          />
          <SummaryCard
            title="Gastos"
            value={formatCurrency(summary.totalExpenses)}
            subtitle={`${transactions.filter(t => t.type === 'expense' || t.type === 'credit').length} transações`}
            icon={<TrendingDown className="h-5 w-5 text-destructive" />}
            variant="expense"
          />
          <SummaryCard
            title="Crédito Usado"
            value={formatCurrency(summary.totalCredit)}
            subtitle={`Disponível: ${formatCurrency(summary.availableCredit)}`}
            icon={<CreditCard className="h-5 w-5 text-primary" />}
            variant="credit"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Main Table */}
          <div className="xl:col-span-8 space-y-4">
            <TransactionFilters filters={filters} onFiltersChange={setFilters} />
            <TransactionTable 
              transactions={filteredTransactions} 
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="xl:col-span-4 space-y-4">
            <StatusSummary summary={summary} />
            <CreditOverview 
              cards={creditCards} 
              availableCredit={summary.availableCredit}
            />
            <CashFlowChart data={chartData} />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
