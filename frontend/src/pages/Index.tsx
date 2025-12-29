import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { CreditOverview } from '@/components/dashboard/CreditOverview';
import { TransactionFilters } from '@/components/dashboard/TransactionFilters';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { StatusSummary } from '@/components/dashboard/StatusSummary';
import { mockTransactions, mockCreditCards, calculateMonthSummary } from '@/data/mockData';
import { formatCurrency, getMonthName } from '@/lib/formatters';
import { FilterState, Transaction, TransactionStatus } from '@/types/finance';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

// Dashboard protegido - não precisa verificar autenticação aqui pois já está protegido pelo ProtectedRoute

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filters, setFilters] = useState<FilterState>({
    month: '2025-01',
    status: 'all',
    category: 'all',
    type: 'all',
    search: '',
  });

  const summary = useMemo(() => 
    calculateMonthSummary(transactions, mockCreditCards),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filters]);

  const handleStatusChange = (id: string, status: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined }
          : t
      )
    );
  };

  const chartData = [
    { name: 'Sem 1', income: 8500, expense: 3200 },
    { name: 'Sem 2', income: 0, expense: 1800 },
    { name: 'Sem 3', income: 2500, expense: 2100 },
    { name: 'Sem 4', income: 0, expense: 1600 },
  ];

  const currentMonth = getMonthName(new Date(2025, 0, 1));

  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth={currentMonth} />
      
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
            subtitle={`${transactions.filter(t => t.type === 'expense').length} transações`}
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
              cards={mockCreditCards} 
              availableCredit={summary.availableCredit}
            />
            <CashFlowChart data={chartData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
