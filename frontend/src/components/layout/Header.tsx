import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, CreditCard, Receipt, FileText, Tag, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface HeaderProps {
  currentMonth: string;
}

export function Header({ currentMonth }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">OingFy</span>
          </Link>
          
          <div className="h-6 w-px bg-border hidden sm:block" />
          
          <span className="text-sm text-muted-foreground hidden sm:block">
            {currentMonth}
          </span>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 ml-4">
            <Button variant="ghost" asChild size="sm">
              <Link to="/credit-cards">
                <CreditCard className="h-4 w-4 mr-2" />
                Cartões
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link to="/accounts-fixed">
                <Receipt className="h-4 w-4 mr-2" />
                Contas Fixas
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link to="/accounts-variable">
                <FileText className="h-4 w-4 mr-2" />
                Contas Variáveis
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link to="/accounts-credit">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Compras
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link to="/money-entries">
                <DollarSign className="h-4 w-4 mr-2" />
                Entradas
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link to="/categories">
                <Tag className="h-4 w-4 mr-2" />
                Categorias
              </Link>
            </Button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nome}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
