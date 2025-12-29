import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { creditCardsApi, CreditCard } from '@/lib/api';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CreditCard as CreditCardIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
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

const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  vencibleAt: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  totalLimite: z.number().min(0.01, 'Limite deve ser maior que zero'),
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

const CreditCards = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
  const [availableLimits, setAvailableLimits] = useState<Record<number, number>>({});

  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      vencibleAt: new Date(),
      totalLimite: 0,
    },
  });

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await creditCardsApi.getAll();
      setCards(data);
      
      // Carregar limites disponíveis para cada cartão
      const limits: Record<number, number> = {};
      await Promise.all(
        data.map(async (card) => {
          try {
            const limit = await creditCardsApi.getAvailableLimit(card.id);
            limits[card.id] = limit.availableLimit;
          } catch (error) {
            limits[card.id] = card.totalLimite;
          }
        })
      );
      setAvailableLimits(limits);
    } catch (error: any) {
      toast.error('Erro ao carregar cartões: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const onSubmit = async (data: CreditCardFormValues) => {
    try {
      const payload = {
        name: data.name,
        vencibleAt: format(data.vencibleAt, 'yyyy-MM-dd'),
        totalLimite: data.totalLimite,
      };

      if (editingCard) {
        await creditCardsApi.update(editingCard.id, payload);
        toast.success('Cartão atualizado com sucesso!');
      } else {
        await creditCardsApi.create(payload);
        toast.success('Cartão criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingCard(null);
      form.reset();
      loadCards();
    } catch (error: any) {
      toast.error('Erro ao salvar cartão: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    form.reset({
      name: card.name,
      vencibleAt: new Date(card.vencibleAt),
      totalLimite: Number(card.totalLimite),
    });
    setDialogOpen(true);
  };

  const handleDelete = (card: CreditCard) => {
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      await creditCardsApi.delete(cardToDelete.id);
      toast.success('Cartão deletado com sucesso!');
      setDeleteDialogOpen(false);
      setCardToDelete(null);
      loadCards();
    } catch (error: any) {
      toast.error('Erro ao deletar cartão: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCard(null);
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
            <h1 className="text-3xl font-bold">Cartões de Crédito</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus cartões de crédito</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
                <DialogDescription>
                  {editingCard ? 'Atualize as informações do cartão' : 'Preencha os dados do novo cartão'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cartão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Nubank, Inter..." {...field} />
                        </FormControl>
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
                    name="totalLimite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite Total</FormLabel>
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

        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Nenhum cartão cadastrado</p>
              <p className="text-muted-foreground text-sm mt-2">Comece adicionando seu primeiro cartão</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const availableLimit = availableLimits[card.id] ?? card.totalLimite;
              const usedLimit = Number(card.totalLimite) - Number(availableLimit);
              const usagePercentage = Number(card.totalLimite) > 0 
                ? (usedLimit / Number(card.totalLimite)) * 100 
                : 0;

              return (
                <Card key={card.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCardIcon className="h-5 w-5" />
                          {card.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Vence dia {format(new Date(card.vencibleAt), 'dd', { locale: ptBR })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(card)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Limite Total</span>
                          <span className="font-medium">{formatCurrency(Number(card.totalLimite))}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Limite Disponível</span>
                          <span className="font-medium text-success">{formatCurrency(Number(availableLimit))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Limite Usado</span>
                          <span className="font-medium">{formatCurrency(usedLimit)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Uso do limite</span>
                          <span>{usagePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              usagePercentage > 80 ? 'bg-destructive' : 
                              usagePercentage > 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cartão "{cardToDelete?.name}"? Esta ação não pode ser desfeita.
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

export default CreditCards;

