import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { accountsVariableApi, categoriesApi, AccountVariable, Category } from '@/lib/api';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
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

const accountVariableSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  vencibleAt: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  categoryId: z.number().min(1, 'Categoria é obrigatória'),
});

type AccountVariableFormValues = z.infer<typeof accountVariableSchema>;

const AccountsVariable = () => {
  const [accounts, setAccounts] = useState<AccountVariable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountVariable | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountVariable | null>(null);

  const form = useForm<AccountVariableFormValues>({
    resolver: zodResolver(accountVariableSchema),
    defaultValues: {
      name: '',
      vencibleAt: new Date(),
      price: 0,
      quantity: 1,
      categoryId: 0,
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, categoriesData] = await Promise.all([
        accountsVariableApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: AccountVariableFormValues) => {
    try {
      const payload = {
        name: data.name,
        vencibleAt: format(data.vencibleAt, 'yyyy-MM-dd'),
        price: data.price,
        quantity: data.quantity,
        categoryId: data.categoryId,
      };

      if (editingAccount) {
        await accountsVariableApi.update(editingAccount.id, payload);
        toast.success('Conta atualizada com sucesso!');
      } else {
        await accountsVariableApi.create(payload);
        toast.success('Conta criada com sucesso!');
      }

      setDialogOpen(false);
      setEditingAccount(null);
      form.reset();
      loadData();
    } catch (error: any) {
      toast.error('Erro ao salvar conta: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (account: AccountVariable) => {
    setEditingAccount(account);
    form.reset({
      name: account.name,
      vencibleAt: new Date(account.vencibleAt),
      price: Number(account.price),
      quantity: account.quantity,
      categoryId: account.categoryId,
    });
    setDialogOpen(true);
  };

  const handleDelete = (account: AccountVariable) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handlePayInstallment = async (account: AccountVariable) => {
    try {
      await accountsVariableApi.payInstallment(account.id);
      toast.success('Parcela paga com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error('Erro ao pagar parcela: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await accountsVariableApi.delete(accountToDelete.id);
      toast.success('Conta deletada com sucesso!');
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error('Erro ao deletar conta: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingAccount(null);
      form.reset();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Contas Variáveis</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas contas parceladas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta Variável
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Editar Conta Variável' : 'Nova Conta Variável'}</DialogTitle>
                <DialogDescription>
                  {editingAccount ? 'Atualize as informações da conta' : 'Preencha os dados da nova conta variável'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Conta</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Parcela Apartamento..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value ? field.value.toString() : ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vencibleAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Vencimento</FormLabel>
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
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Parcela</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de Parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhuma conta variável cadastrada</p>
            <p className="text-muted-foreground text-sm mt-2">Comece adicionando sua primeira conta variável</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Parcelas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const totalPaid = account.qtPayed;
                  const total = account.quantity;
                  const remaining = total - totalPaid;
                  const progress = total > 0 ? (totalPaid / total) * 100 : 0;

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.category?.name || '-'}</TableCell>
                      <TableCell>{formatDate(account.vencibleAt)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(account.price))}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm">
                            {totalPaid}/{total}
                          </span>
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {remaining > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayInstallment(account)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(account)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a conta "{accountToDelete?.name}"? Esta ação não pode ser desfeita.
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
      </div>
    </div>
  );
};

export default AccountsVariable;

