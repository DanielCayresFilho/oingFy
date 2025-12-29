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
      return result || this.findOne(userId, month, year);
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
        // Pegar apenas o dia do vencimento e aplicar ao mês/ano correto
        const originalDate = new Date(account.vencibleAt);
        const day = originalDate.getDate();
        
        // Criar data no mês/ano correto, tratando casos onde o dia não existe (ex: 31 de fevereiro)
        const dueDate = new Date(year, month - 1, Math.min(day, new Date(year, month, 0).getDate()));

        items.push({
          monthMovimentationId: movimentation.id,
          accountType: 'VARIABLE',
          accountId: account.id,
          accountName: account.name,
          dueDate,
          amount: account.price,
          status: 'PENDING',
          categoryName: account.category.name,
          accountVariableId: account.id,
        });
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
        
        // Lógica de parcelas:
        // Se comprou em janeiro e estamos em fevereiro (monthsDiff = 1):
        // - Deve mostrar a parcela 1
        // Se comprou em janeiro, já pagou 1 parcela, e estamos em março (monthsDiff = 2):
        // - Deve mostrar a parcela 2
        // Se comprou em janeiro, não pagou nenhuma, e estamos em março (monthsDiff = 2):
        // - Deve mostrar a parcela 1 (a primeira que ainda não foi paga)
        // 
        // A parcela que deve aparecer no mês atual é: installmentsPayed + 1
        // Mas só se já passou tempo suficiente desde a compra
        // monthsDiff = 1 significa que passou 1 mês, então a parcela 1 deve aparecer
        // monthsDiff = 2 significa que passaram 2 meses, então a parcela 2 deve aparecer (se pagou a 1) OU a parcela 1 (se não pagou)
        // 
        // Na verdade, devemos mostrar a próxima parcela a ser paga (installmentsPayed + 1)
        // Mas só se já passou tempo suficiente (monthsDiff >= installmentsPayed + 1)
        const nextInstallment = account.installmentsPayed + 1;
        
        // Só criar item se:
        // 1. Já passou tempo suficiente para essa parcela aparecer (monthsDiff >= nextInstallment)
        // 2. Ainda tem parcelas para pagar (nextInstallment <= account.installments)
        if (monthsDiff >= nextInstallment && nextInstallment <= account.installments) {
          // Pegar apenas o dia do vencimento do cartão e aplicar ao mês/ano correto
          const originalDate = new Date(account.card.vencibleAt);
          const day = originalDate.getDate();
          
          // Criar data no mês/ano correto, tratando casos onde o dia não existe (ex: 31 de fevereiro)
          const dueDate = new Date(year, month - 1, Math.min(day, new Date(year, month, 0).getDate()));

          items.push({
            monthMovimentationId: movimentation.id,
            accountType: 'CREDIT',
            accountId: account.id,
            accountName: `${account.name} (${nextInstallment}/${account.installments})`,
            dueDate,
            amount: account.installmentsPrice,
            status: 'PENDING',
            categoryName: account.category.name,
            accountCreditId: account.id,
          });
        }
      }
    }

    if (items.length > 0) {
      await this.prisma.monthMovimentationItem.createMany({
        data: items,
      });
    }

    const currentDate = new Date();
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

    const totalIncome = moneyEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);

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

    if (item.accountVariableId) {
      await this.prisma.accountVariable.update({
        where: { id: item.accountVariableId },
        data: {
          qtPayed: {
            increment: 1,
          },
        },
      });
    }

    if (item.accountCreditId) {
      await this.prisma.accountCredit.update({
        where: { id: item.accountCreditId },
        data: {
          installmentsPayed: {
            increment: 1,
          },
        },
      });
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

    if (item.accountVariableId) {
      const account = await this.prisma.accountVariable.findUnique({
        where: { id: item.accountVariableId },
      });

      if (account && account.qtPayed > 0) {
        await this.prisma.accountVariable.update({
          where: { id: item.accountVariableId },
          data: {
            qtPayed: {
              decrement: 1,
            },
          },
        });
      }
    }

    if (item.accountCreditId) {
      const account = await this.prisma.accountCredit.findUnique({
        where: { id: item.accountCreditId },
      });

      if (account && account.installmentsPayed > 0) {
        await this.prisma.accountCredit.update({
          where: { id: item.accountCreditId },
          data: {
            installmentsPayed: {
              decrement: 1,
            },
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
