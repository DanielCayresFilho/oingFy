import { useState } from 'react';
import { Transaction, TransactionStatus } from '@/types/finance';
import { formatCurrency, formatDate, getCategoryLabel, getCategoryIcon, getStatusLabel } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertTriangle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface TransactionTableProps {
  transactions: Transaction[];
  onStatusChange: (id: string, status: TransactionStatus) => void;
}

const statusConfig: Record<TransactionStatus, { icon: React.ElementType; class: string }> = {
  paid: { icon: Check, class: 'status-paid' },
  pending: { icon: Clock, class: 'status-pending' },
  overdue: { icon: AlertTriangle, class: 'status-overdue' },
  early: { icon: Zap, class: 'status-early' },
};

export function TransactionTable({ transactions, onStatusChange }: TransactionTableProps) {
  const [sortField, setSortField] = useState<'dueDate' | 'amount'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'dueDate' | 'amount') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortField === 'dueDate') {
      return sortDir === 'asc' 
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return sortDir === 'asc' 
      ? a.amount - b.amount 
      : b.amount - a.amount;
  });

  const handleTogglePaid = (transaction: Transaction) => {
    if (transaction.status === 'paid' || transaction.status === 'early') {
      onStatusChange(transaction.id, 'pending');
    } else {
      onStatusChange(transaction.id, 'paid');
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pago
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Descrição
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Categoria
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  onClick={() => handleSort('dueDate')}
                >
                  Vencimento
                  {sortField === 'dueDate' && (
                    sortDir === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </span>
              </th>
              <th className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  onClick={() => handleSort('amount')}
                >
                  Valor
                  {sortField === 'amount' && (
                    sortDir === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction, index) => {
              const StatusIcon = statusConfig[transaction.status].icon;
              const isPaidOrEarly = transaction.status === 'paid' || transaction.status === 'early';
              
              return (
                <tr
                  key={transaction.id}
                  className={cn(
                    'border-b border-border/30 transition-colors hover:bg-secondary/30',
                    isPaidOrEarly && 'opacity-70'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={isPaidOrEarly}
                      onCheckedChange={() => handleTogglePaid(transaction)}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                      <div>
                        <p className={cn(
                          'font-medium text-sm',
                          isPaidOrEarly && 'line-through text-muted-foreground'
                        )}>
                          {transaction.description}
                        </p>
                        {transaction.cardName && (
                          <p className="text-xs text-muted-foreground">
                            {transaction.cardName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {getCategoryLabel(transaction.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {formatDate(transaction.dueDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                      statusConfig[transaction.status].class
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      {getStatusLabel(transaction.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      'font-semibold text-sm tabular-nums',
                      transaction.amount >= 0 ? 'text-money-positive' : 'text-money-negative'
                    )}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {transactions.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
        </div>
      )}
    </div>
  );
}
