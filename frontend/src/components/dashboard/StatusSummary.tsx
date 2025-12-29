import { MonthSummary } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSummaryProps {
  summary: MonthSummary;
}

export function StatusSummary({ summary }: StatusSummaryProps) {
  const total = summary.paidCount + summary.pendingCount + summary.overdueCount;
  
  const stats = [
    {
      label: 'Pagos',
      count: summary.paidCount,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/20',
    },
    {
      label: 'Pendentes',
      count: summary.pendingCount,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      label: 'Atrasados',
      count: summary.overdueCount,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
    },
  ];

  return (
    <div className="glass-card rounded-xl p-5 animate-slide-up">
      <h3 className="font-semibold text-foreground mb-4">Resumo do Mês</h3>
      
      {/* Progress Overview */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {summary.paidCount}/{total} pagos
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${(summary.paidCount / total) * 100}%` }}
          />
          <div 
            className="h-full bg-warning transition-all duration-500"
            style={{ width: `${(summary.pendingCount / total) * 100}%` }}
          />
          <div 
            className="h-full bg-destructive transition-all duration-500"
            style={{ width: `${(summary.overdueCount / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={cn(
              'w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center',
              stat.bgColor
            )}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="text-2xl font-semibold">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
