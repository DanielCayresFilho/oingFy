import { useState, useEffect } from 'react';
import { FilterState, TransactionCategory, TransactionStatus, TransactionType } from '@/types/finance';
import { getStatusLabel } from '@/lib/formatters';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoriesApi, Category } from '@/lib/api';

interface TransactionFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const statuses: TransactionStatus[] = ['paid', 'pending', 'overdue', 'early'];
const types: TransactionType[] = ['income', 'expense', 'credit'];

// Gerar meses dinamicamente (últimos 12 meses e próximos 2)
const generateMonths = () => {
  const months = [];
  const currentDate = new Date();
  
  // Próximos 2 meses
  for (let i = 0; i < 2; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    });
  }
  
  // Últimos 12 meses
  for (let i = 1; i <= 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    });
  }
  
  return months;
};

const months = generateMonths();

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    filters.search !== '';

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      status: 'all',
      category: 'all',
      type: 'all',
      search: '',
    });
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar movimentação..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>

        {/* Month */}
        <Select
          value={filters.month}
          onValueChange={(value) => onFiltersChange({ ...filters, month: value })}
        >
          <SelectTrigger className="w-full lg:w-[180px] bg-secondary/50 border-border/50">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as TransactionStatus | 'all' })}
        >
          <SelectTrigger className="w-full lg:w-[140px] bg-secondary/50 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(value) => onFiltersChange({ ...filters, category: value as TransactionCategory | 'all' })}
          disabled={loadingCategories}
        >
          <SelectTrigger className="w-full lg:w-[150px] bg-secondary/50 border-border/50">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={loadingCategories ? "Carregando..." : "Categoria"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select
          value={filters.type}
          onValueChange={(value) => onFiltersChange({ ...filters, type: value as TransactionType | 'all' })}
        >
          <SelectTrigger className="w-full lg:w-[130px] bg-secondary/50 border-border/50">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos tipos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
