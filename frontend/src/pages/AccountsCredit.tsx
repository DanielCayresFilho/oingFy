import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { accountsCreditApi, creditCardsApi, categoriesApi, AccountCredit, CreditCard, Category } from '@/lib/api';
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
import { Plus, Edit, Trash2, Check, CreditCard as CreditCardIcon } from 'lucide-react';
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

const accountCreditSchema = z.object({
  cardId: z.number().min(1, 'Cartão é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  totalPrice: z.number().min(0.01, 'Preço total deve ser maior que zero'),
  installmentsPrice: z.number().min(0.01, 'Valor da parcela deve ser maior que zero'),
  installments: z.number().min(1, 'Número de parcelas deve ser maior que zero'),
  categoryId: z.number().min(1, 'Categoria é obrigatória'),
  purchaseDate: z.date().optional(),
});

type AccountCreditFormValues = z.infer<typeof accountCreditSchema>;

const AccountsCredit = () => {
  const [accounts, setAccounts] = useState<AccountCredit[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCredit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountCredit | null>(null);
  const [filterCardId, setFilterCardId] = useState<number | undefined>(undefined);

  const form = useForm<AccountCreditFormValues>({
    resolver: zodResolver(accountCreditSchema),
    defaultValues: {
      cardId: 0,
      name: '',
      totalPrice: 0,
      installmentsPrice: 0,
      installments: 1,
      categoryId: 0,
      purchaseDate: new Date(),
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, cardsData, categoriesData] = await Promise.all([
        accountsCreditApi.getAll(filterCardId),
        creditCardsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setAccounts(accountsData);
      setCards(cardsData);
      setCategories(categoriesData);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCardId]);

  const onSubmit = async (data: AccountCreditFormValues) => {
    try {
      const payload = {
        cardId: data.cardId,
        name: data.name,
        totalPrice: data.totalPrice,
        installmentsPrice: data.installmentsPrice,
        installments: data.installments,
        categoryId: data.categoryId,
        purchaseDate: data.purchaseDate ? format(data.purchaseDate, 'yyyy-MM-dd') : undefined,
      };

      if (editingAccount) {
        await accountsCreditApi.update(editingAccount.id, payload);
        toast.success('Conta de crédito atualizada com sucesso!');
      } else {
        await accountsCreditApi.create(payload);
        toast.success('Conta de crédito criada com sucesso!');
      }

      setDialogOpen(false);
      setEditingAccount(null);
      form.reset();
      loadData();
    } catch (error: any) {
      toast.error('Erro ao salvar conta de crédito: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (account: AccountCredit) => {
    setEditingAccount(account);
    form.reset({
      cardId: account.cardId,
      name: account.name,
      totalPrice: Number(account.totalPrice),
      installmentsPrice: Number(account.installmentsPrice),
      installments: account.installments,
      categoryId: account.categoryId,
      purchaseDate: account.purchaseDate ? new Date(account.purchaseDate) : new Date(),
    });
    setDialogOpen(true);
  };

  const handleDelete = (account: AccountCredit) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handlePayInstallment = async (account: AccountCredit) => {
    try {
      await accountsCreditApi.payInstallment(account.id);
      toast.success('Parcela paga com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error('Erro ao pagar parcela: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await accountsCreditApi.delete(accountToDelete.id);
      toast.success('Conta de crédito deletada com sucesso!');
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error('Erro ao deletar conta de crédito: ' + (error.response?.data?.message || error.message));
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
            <h1 className="text-3xl font-bold">Contas de Crédito</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas compras parceladas no cartão</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Editar Conta de Crédito' : 'Nova Conta de Crédito'}</DialogTitle>
                <DialogDescription>
                  {editingAccount ? 'Atualize as informações da compra' : 'Preencha os dados da nova compra parcelada'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cartão</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value ? field.value.toString() : ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cartão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cards.map((card) => (
                              <SelectItem key={card.id} value={card.id.toString()}>
                                {card.name}
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Compra</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Notebook, Smartphone..." {...field} />
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Total</FormLabel>
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
                      name="installmentsPrice"
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
                  </div>
                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data da Compra (Opcional)</FormLabel>
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

        {/* Filtro por cartão */}
        <div className="mb-4">
          <Select
            value={filterCardId?.toString() || 'all'}
            onValueChange={(value) => setFilterCardId(value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por cartão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cartões</SelectItem>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id.toString()}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Nenhuma compra parcelada cadastrada</p>
            <p className="text-muted-foreground text-sm mt-2">Comece adicionando sua primeira compra parcelada</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cartão</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Valor Parcela</TableHead>
                  <TableHead className="text-center">Parcelas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const totalPaid = account.installmentsPayed;
                  const total = account.installments;
                  const remaining = total - totalPaid;
                  const progress = total > 0 ? (totalPaid / total) * 100 : 0;

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.card?.name || '-'}</TableCell>
                      <TableCell>{account.category?.name || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(account.totalPrice))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(account.installmentsPrice))}
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
                Tem certeza que deseja excluir a compra "{accountToDelete?.name}"? Esta ação não pode ser desfeita.
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

export default AccountsCredit;

