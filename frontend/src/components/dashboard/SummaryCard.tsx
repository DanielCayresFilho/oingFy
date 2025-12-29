import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense' | 'credit';
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: SummaryCardProps) {
  const gradientClasses = {
    default: 'gradient-primary',
    income: 'gradient-income',
    expense: 'gradient-expense',
    credit: 'gradient-credit',
  };

  const valueClasses = {
    default: 'text-foreground',
    income: 'text-money-positive',
    expense: 'text-money-negative',
    credit: 'text-primary',
  };

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 animate-slide-up',
        gradientClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-secondary/50">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.isPositive 
                ? 'bg-success/20 text-success' 
                : 'bg-destructive/20 text-destructive'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={cn('text-2xl font-semibold tracking-tight', valueClasses[variant])}>
        {value}
      </p>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
}
