import { CreditCard } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import { CreditCard as CreditCardIcon } from 'lucide-react';

interface CreditOverviewProps {
  cards: CreditCard[];
  availableCredit: number;
}

export function CreditOverview({ cards, availableCredit }: CreditOverviewProps) {
  const totalLimit = cards.reduce((sum, c) => sum + c.limit, 0);
  const totalUsed = cards.reduce((sum, c) => sum + c.used, 0);
  const usagePercent = (totalUsed / totalLimit) * 100;

  return (
    <div className="glass-card rounded-xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Limite de Crédito</h3>
        <CreditCardIcon className="h-5 w-5 text-primary" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Usado</span>
          <span className="text-foreground font-medium">
            {formatCurrency(totalUsed)} / {formatCurrency(totalLimit)}
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Available Credit */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
        <p className="text-xs text-muted-foreground">Disponível para uso</p>
        <p className="text-xl font-semibold text-primary">
          {formatCurrency(availableCredit)}
        </p>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {cards.map((card) => {
          const cardUsage = (card.used / card.limit) * 100;
          return (
            <div key={card.id} className="flex items-center gap-3">
              <div
                className="w-2 h-8 rounded-full"
                style={{ backgroundColor: card.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{card.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Venc. dia {card.dueDay}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${cardUsage}%`,
                        backgroundColor: card.color 
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(card.used)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
