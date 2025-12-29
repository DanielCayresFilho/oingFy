import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MonthMovimentationService {
  constructor(private prisma: PrismaService) {}

  async generateMonthMovimentation(userId: number, month: number, year: number) {
    const existingMovimentation = await this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (existingMovimentation) {
      const result = await this.updateMonthMovimentation(userId, month, year);
      return result || await this.findOne(userId, month, year);
    }

    const movimentation = await this.prisma.monthMovimentation.create({
      data: {
        userId,
        month,
        year,
        totalIncome: 0,
        totalExpenses: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        balance: 0,
      },
    });

    await this.updateMonthMovimentation(userId, month, year);

    const result = await this.findOne(userId, month, year);
    if (!result) {
      // Retornar movimentação vazia se não encontrar (não deveria acontecer, mas por segurança)
      return {
        ...movimentation,
        items: [],
      };
    }
    return result;
  }

  async updateMonthMovimentation(userId: number, month: number, year: number) {
    const movimentation = await this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (!movimentation) {
      throw new Error('Movimentação não encontrada');
    }

    await this.prisma.monthMovimentationItem.deleteMany({
      where: {
        monthMovimentationId: movimentation.id,
      },
    });

    const items: Prisma.MonthMovimentationItemCreateManyInput[] = [];

    const accountsFixed = await this.prisma.accountFixed.findMany({
      where: { userId },
      include: { category: true },
    });

    for (const account of accountsFixed) {
      // Pegar apenas o dia do vencimento e aplicar ao mês/ano correto
      const originalDate = new Date(account.vencibleAt);
      const day = originalDate.getDate();
      
      // Criar data no mês/ano correto, tratando casos onde o dia não existe (ex: 31 de fevereiro)
      const dueDate = new Date(year, month - 1, Math.min(day, new Date(year, month, 0).getDate()));

      items.push({
        monthMovimentationId: movimentation.id,
        accountType: 'FIXED',
        accountId: account.id,
        accountName: account.name,
        dueDate,
        amount: account.price,
        status: 'PENDING',
        categoryName: account.category.name,
        accountFixedId: account.id,
      });
    }

    const accountsVariable = await this.prisma.accountVariable.findMany({
      where: { userId },
      include: { category: true },
    });

    for (const account of accountsVariable) {
      if (account.qtPayed < account.quantity) {
        // CORREÇÃO: Calcular qual parcela deveria vencer neste mês
        const firstDueDate = new Date(account.vencibleAt);
        firstDueDate.setHours(0, 0, 0, 0);

        const targetDate = new Date(year, month - 1, 1);
        targetDate.setHours(0, 0, 0, 0);

        // Calcular quantos meses se passaram desde a primeira parcela
        const monthsDiff = (targetDate.getFullYear() - firstDueDate.getFullYear()) * 12 +
                          (targetDate.getMonth() - firstDueDate.getMonth());

        // A primeira parcela vence no mês 0 (mês da criação)
        // A segunda parcela vence no mês 1 (1 mês depois)
        // monthsDiff = 0 significa que estamos no mês da primeira parcela
        // monthsDiff = 1 significa que estamos no mês da segunda parcela

        if (monthsDiff >= 0) {
          // Calcular qual parcela deveria vencer neste mês (1-indexed)
          const installmentDueThisMonth = monthsDiff + 1;

          // Verificar se esta parcela ainda não foi paga e está dentro do total
          if (installmentDueThisMonth <= account.quantity &&
              installmentDueThisMonth > account.qtPayed) {
            // Pegar apenas o dia do vencimento e aplicar ao mês/ano correto
            const day = firstDueDate.getDate();

            // Criar data no mês/ano correto, tratando casos onde o dia não existe (ex: 31 de fevereiro)
            const dueDate = new Date(year, month - 1, Math.min(day, new Date(year, month, 0).getDate()));

            items.push({
              monthMovimentationId: movimentation.id,
              accountType: 'VARIABLE',
              accountId: account.id,
              accountName: `${account.name} (${installmentDueThisMonth}/${account.quantity})`,
              dueDate,
              amount: account.price,
              status: 'PENDING',
              categoryName: account.category.name,
              accountVariableId: account.id,
              installmentNumber: installmentDueThisMonth,
            });
          }
        }
      }
    }

    const accountsCredit = await this.prisma.accountCredit.findMany({
      where: {
        card: {
          userId,
        },
      },
      include: {
        card: true,
        category: true,
      },
    });

    for (const account of accountsCredit) {
      if (account.installmentsPayed < account.installments) {
        const purchaseDate = new Date(account.purchaseDate);
        purchaseDate.setHours(0, 0, 0, 0);

        // Calcular quantos meses se passaram desde a compra
        const targetDate = new Date(year, month - 1, 1);
        targetDate.setHours(0, 0, 0, 0);

        // Calcular diferença em meses
        const monthsDiff = (targetDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
                          (targetDate.getMonth() - purchaseDate.getMonth());

        // CORREÇÃO: Determinar qual parcela deve aparecer neste mês específico
        // Se comprou em janeiro (mês 0) e estamos em:
        // - Janeiro (mês 0): monthsDiff = 0, parcela que vence = 0 (não mostra ainda, compra no mesmo mês)
        // - Fevereiro (mês 1): monthsDiff = 1, parcela que vence = 1
        // - Março (mês 2): monthsDiff = 2, parcela que vence = 2
        //
        // A parcela que vence no mês atual é baseada no tempo decorrido, não nas parcelas pagas
        // Isso permite mostrar parcelas atrasadas

        if (monthsDiff > 0) {
          // Calcular qual parcela deveria vencer neste mês (baseado no tempo)
          const installmentDueThisMonth = monthsDiff;

          // Verificar se esta parcela ainda não foi totalmente paga
          // e se está dentro do número total de parcelas
          if (installmentDueThisMonth <= account.installments &&
              installmentDueThisMonth > account.installmentsPayed) {
            // Pegar apenas o dia do vencimento do cartão e aplicar ao mês/ano correto
            const originalDate = new Date(account.card.vencibleAt);
            const day = originalDate.getDate();

            // Criar data no mês/ano correto, tratando casos onde o dia não existe (ex: 31 de fevereiro)
            const dueDate = new Date(year, month - 1, Math.min(day, new Date(year, month, 0).getDate()));

            items.push({
              monthMovimentationId: movimentation.id,
              accountType: 'CREDIT',
              accountId: account.id,
              accountName: `${account.name} (${installmentDueThisMonth}/${account.installments})`,
              dueDate,
              amount: account.installmentsPrice,
              status: 'PENDING',
              categoryName: account.category.name,
              accountCreditId: account.id,
              installmentNumber: installmentDueThisMonth,
            });
          }
        }
      }
    }

    if (items.length > 0) {
      await this.prisma.monthMovimentationItem.createMany({
        data: items,
      });
    }

    // Buscar receitas do mês e verificar items atrasados
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

    const isCurrentOrPastMonth = year < currentDate.getFullYear() ||
      (year === currentDate.getFullYear() && month <= currentDate.getMonth() + 1);

    if (isCurrentOrPastMonth) {
      const allItems = await this.prisma.monthMovimentationItem.findMany({
        where: { monthMovimentationId: movimentation.id },
      });

      for (const item of allItems) {
        if (item.dueDate < currentDate && item.status === 'PENDING') {
          await this.prisma.monthMovimentationItem.update({
            where: { id: item.id },
            data: { status: 'OVERDUE' },
          });
        }
      }
    }

    const moneyEntries = await this.prisma.moneyEntry.findMany({
      where: {
        userId,
        entryDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    // Somar apenas receitas que já foram recebidas (entryDate <= hoje)
    const totalIncome = moneyEntries.reduce((sum, entry) => {
      const entryDate = new Date(entry.entryDate);
      entryDate.setHours(0, 0, 0, 0);

      // Só conta se a data da receita já passou
      if (entryDate <= currentDate) {
        return sum + Number(entry.amount);
      }
      return sum;
    }, 0);

    const updatedItems = await this.prisma.monthMovimentationItem.findMany({
      where: { monthMovimentationId: movimentation.id },
    });

    const totalExpenses = updatedItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPaid = updatedItems
      .filter(item => item.status === 'PAID')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPending = updatedItems
      .filter(item => item.status === 'PENDING')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalOverdue = updatedItems
      .filter(item => item.status === 'OVERDUE')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const balance = totalIncome - totalPaid;

    await this.prisma.monthMovimentation.update({
      where: { id: movimentation.id },
      data: {
        totalIncome,
        totalExpenses,
        totalPaid,
        totalPending,
        totalOverdue,
        balance,
      },
    });

    const result = await this.findOne(userId, month, year);
    if (!result) {
      throw new Error('Erro ao buscar movimentação após atualização');
    }
    return result;
  }

  async findOne(userId: number, month: number, year: number) {
    return this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      include: {
        items: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.monthMovimentation.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async payItem(userId: number, itemId: number) {
    const item = await this.prisma.monthMovimentationItem.findUnique({
      where: { id: itemId },
      include: {
        monthMovimentation: true,
      },
    });

    if (!item || item.monthMovimentation.userId !== userId) {
      throw new Error('Item não encontrado');
    }

    if (item.status === 'PAID') {
      throw new Error('Item já foi pago');
    }

    await this.prisma.monthMovimentationItem.update({
      where: { id: itemId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Atualizar o contador de parcelas pagas baseado no número da parcela
    if (item.accountVariableId && item.installmentNumber) {
      const account = await this.prisma.accountVariable.findUnique({
        where: { id: item.accountVariableId },
      });

      // Atualizar qtPayed apenas se esta parcela for maior que o atual
      // Isso permite pagar parcelas fora de ordem
      if (account && item.installmentNumber > account.qtPayed) {
        await this.prisma.accountVariable.update({
          where: { id: item.accountVariableId },
          data: {
            qtPayed: item.installmentNumber,
          },
        });
      }
    }

    if (item.accountCreditId && item.installmentNumber) {
      const account = await this.prisma.accountCredit.findUnique({
        where: { id: item.accountCreditId },
      });

      // Atualizar installmentsPayed apenas se esta parcela for maior que o atual
      // Isso permite pagar parcelas fora de ordem
      if (account && item.installmentNumber > account.installmentsPayed) {
        await this.prisma.accountCredit.update({
          where: { id: item.accountCreditId },
          data: {
            installmentsPayed: item.installmentNumber,
          },
        });
      }
    }

    return this.updateMonthMovimentation(
      item.monthMovimentation.userId,
      item.monthMovimentation.month,
      item.monthMovimentation.year,
    );
  }

  async unpayItem(userId: number, itemId: number) {
    const item = await this.prisma.monthMovimentationItem.findUnique({
      where: { id: itemId },
      include: {
        monthMovimentation: true,
      },
    });

    if (!item || item.monthMovimentation.userId !== userId) {
      throw new Error('Item não encontrado');
    }

    if (item.status !== 'PAID') {
      throw new Error('Item não está pago');
    }

    await this.prisma.monthMovimentationItem.update({
      where: { id: itemId },
      data: {
        status: 'PENDING',
        paidAt: null,
      },
    });

    // Recalcular o contador de parcelas pagas
    // Buscar o maior número de parcela que ainda está paga
    if (item.accountVariableId) {
      const paidItems = await this.prisma.monthMovimentationItem.findMany({
        where: {
          accountVariableId: item.accountVariableId,
          status: 'PAID',
          installmentNumber: { not: null },
        },
        orderBy: {
          installmentNumber: 'desc',
        },
        take: 1,
      });

      const maxPaidInstallment = paidItems.length > 0 ? paidItems[0].installmentNumber : 0;

      await this.prisma.accountVariable.update({
        where: { id: item.accountVariableId },
        data: {
          qtPayed: maxPaidInstallment || 0,
        },
      });
    }

    if (item.accountCreditId) {
      const paidItems = await this.prisma.monthMovimentationItem.findMany({
        where: {
          accountCreditId: item.accountCreditId,
          status: 'PAID',
          installmentNumber: { not: null },
        },
        orderBy: {
          installmentNumber: 'desc',
        },
        take: 1,
      });

      const maxPaidInstallment = paidItems.length > 0 ? paidItems[0].installmentNumber : 0;

      await this.prisma.accountCredit.update({
        where: { id: item.accountCreditId },
        data: {
          installmentsPayed: maxPaidInstallment || 0,
        },
      });
    }

    return this.updateMonthMovimentation(
      item.monthMovimentation.userId,
      item.monthMovimentation.month,
      item.monthMovimentation.year,
    );
  }

  async getItemsByCategory(userId: number, month: number, year: number) {
    const movimentation = await this.findOne(userId, month, year);

    if (!movimentation) {
      throw new Error('Movimentação não encontrada');
    }

    const categoryTotals = movimentation.items.reduce((acc, item) => {
      const category = item.categoryName;
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
          items: [],
        };
      }

      acc[category].total += Number(item.amount);
      acc[category].items.push(item);

      if (item.status === 'PAID') {
        acc[category].paid += Number(item.amount);
      } else if (item.status === 'PENDING') {
        acc[category].pending += Number(item.amount);
      } else if (item.status === 'OVERDUE') {
        acc[category].overdue += Number(item.amount);
      }

      return acc;
    }, {});

    return Object.values(categoryTotals);
  }
}
