import { ReactNode } from 'react';
import { Header } from './Header';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LayoutProps {
  children: ReactNode;
  currentMonth?: Date;
}

export function Layout({ children, currentMonth }: LayoutProps) {
  const monthString = currentMonth 
    ? format(currentMonth, 'MMMM yyyy', { locale: ptBR })
    : format(new Date(), 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth={monthString} />
      {children}
    </div>
  );
}

