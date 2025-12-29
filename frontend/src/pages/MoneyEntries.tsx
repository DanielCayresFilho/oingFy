import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { moneyEntriesApi, MoneyEntry } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Layout } from '@/components/layout/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const moneyEntrySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  entryDate: z.date({
    required_error: 'Data de entrada é obrigatória',
  }),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
});

type MoneyEntryFormValues = z.infer<typeof moneyEntrySchema>;

const MoneyEntries = () => {
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoneyEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<MoneyEntry | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  const form = useForm<MoneyEntryFormValues>({
    resolver: zodResolver(moneyEntrySchema),
    defaultValues: {
      name: '',
      entryDate: new Date(),
      amount: 0,
    },
  });

  const loadEntries = async () => {
    try {
      setLoading(true);
      let data: MoneyEntry[];
      
      if (filterMonth && filterYear) {
        data = await moneyEntriesApi.findByMonth(parseInt(filterMonth), parseInt(filterYear));
      } else {
        data = await moneyEntriesApi.getAll();
      }
      
      setEntries(data.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()));
    } catch (error: any) {
      toast.error('Erro ao carregar entradas: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [filterMonth, filterYear]);

  const onSubmit = async (data: MoneyEntryFormValues) => {
    try {
      const payload = {
        name: data.name,
        entryDate: format(data.entryDate, 'yyyy-MM-dd'),
        amount: data.amount,
      };

      if (editingEntry) {
        await moneyEntriesApi.update(editingEntry.id, payload);
        toast.success('Entrada atualizada com sucesso!');
      } else {
        await moneyEntriesApi.create(payload);
        toast.success('Entrada criada com sucesso!');
      }

      setDialogOpen(false);
      setEditingEntry(null);
      form.reset();
      loadEntries();
    } catch (error: any) {
      toast.error('Erro ao salvar entrada: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (entry: MoneyEntry) => {
    setEditingEntry(entry);
    form.reset({
      name: entry.name,
      entryDate: new Date(entry.entryDate),
      amount: Number(entry.amount),
    });
    setDialogOpen(true);
  };

  const handleDelete = (entry: MoneyEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      await moneyEntriesApi.delete(entryToDelete.id);
      toast.success('Entrada deletada com sucesso!');
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      loadEntries();
    } catch (error: any) {
      toast.error('Erro ao deletar entrada: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingEntry(null);
      form.reset();
    }
  };

  const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, '0'),
    label: format(new Date(2024, i, 1), 'MMMM', { locale: ptBR }),
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Entradas de Dinheiro</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas receitas e entradas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Entrada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? 'Editar Entrada' : 'Nova Entrada'}</DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Atualize as informações da entrada' : 'Preencha os dados da nova entrada'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Entrada</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Salário, Freelance..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data da Entrada</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex gap-4">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os meses</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os anos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterMonth || filterYear) && (
            <Button variant="outline" onClick={() => { setFilterMonth(''); setFilterYear(''); }}>
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Resumo */}
        {entries.length > 0 && (
          <div className="mb-4 p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total de Entradas:</span>
              <span className="text-2xl font-bold text-success">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Nenhuma entrada cadastrada</p>
            <p className="text-muted-foreground text-sm mt-2">Comece adicionando sua primeira entrada</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{formatDate(entry.entryDate)}</TableCell>
                    <TableCell className="text-right font-medium text-success">
                      {formatCurrency(Number(entry.amount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a entrada "{entryToDelete?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </Layout>
  );
};

export default MoneyEntries;

