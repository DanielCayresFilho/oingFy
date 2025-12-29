import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialSummary(userId: number, month: number, year: number) {
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

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

    const movimentation = await this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
      include: {
        items: true,
      },
    });

    if (!movimentation) {
      return {
        month,
        year,
        totalIncome,
        totalExpenses: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        balance: totalIncome,
        availableMoney: totalIncome,
      };
    }

    const availableMoney = Number(movimentation.balance);

    return {
      month,
      year,
      totalIncome: Number(movimentation.totalIncome),
      totalExpenses: Number(movimentation.totalExpenses),
      totalPaid: Number(movimentation.totalPaid),
      totalPending: Number(movimentation.totalPending),
      totalOverdue: Number(movimentation.totalOverdue),
      balance: Number(movimentation.balance),
      availableMoney,
    };
  }

  async getCreditCardsSummary(userId: number) {
    const creditCards = await this.prisma.creditCard.findMany({
      where: { userId },
      include: {
        accountsCredit: true,
      },
    });

    return creditCards.map(card => {
      const totalUsed = card.accountsCredit.reduce((sum, account) => {
        const remainingInstallments = account.installments - account.installmentsPayed;
        return sum + Number(account.installmentsPrice) * remainingInstallments;
      }, 0);

      const totalLimit = Number(card.totalLimite);
      const availableLimit = totalLimit - totalUsed;
      const usagePercentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

      return {
        id: card.id,
        name: card.name,
        totalLimit,
        usedLimit: totalUsed,
        availableLimit,
        usagePercentage: parseFloat(usagePercentage.toFixed(2)),
        activeAccounts: card.accountsCredit.filter(
          acc => acc.installmentsPayed < acc.installments
        ).length,
      };
    });
  }

  async getExpensesByCategory(userId: number, month: number, year: number) {
    const movimentation = await this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
      include: {
        items: true,
      },
    });

    if (!movimentation) {
      return [];
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
          percentage: 0,
        };
      }

      acc[category].total += Number(item.amount);

      if (item.status === 'PAID') {
        acc[category].paid += Number(item.amount);
      } else if (item.status === 'PENDING') {
        acc[category].pending += Number(item.amount);
      } else if (item.status === 'OVERDUE') {
        acc[category].overdue += Number(item.amount);
      }

      return acc;
    }, {});

    const totalExpenses = Number(movimentation.totalExpenses);

    return Object.values(categoryTotals).map((cat: any) => ({
      ...cat,
      percentage: totalExpenses > 0 ? parseFloat(((cat.total / totalExpenses) * 100).toFixed(2)) : 0,
    }));
  }

  async getUpcomingBills(userId: number, days: number = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const currentMonth = startDate.getMonth() + 1;
    const currentYear = startDate.getFullYear();

    const movimentation = await this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: { userId, month: currentMonth, year: currentYear },
      },
      include: {
        items: {
          where: {
            status: {
              in: ['PENDING', 'OVERDUE'],
            },
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    return movimentation?.items || [];
  }

  async getOverdueBills(userId: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const movimentation = await this.prisma.monthMovimentation.findUnique({
      where: {
        userId_month_year: { userId, month: currentMonth, year: currentYear },
      },
      include: {
        items: {
          where: {
            status: 'OVERDUE',
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    return movimentation?.items || [];
  }

  async getYearlyComparison(userId: number, year: number) {
    const movimentations = await this.prisma.monthMovimentation.findMany({
      where: {
        userId,
        year,
      },
      orderBy: {
        month: 'asc',
      },
    });

    return movimentations.map(mov => ({
      month: mov.month,
      year: mov.year,
      totalIncome: Number(mov.totalIncome),
      totalExpenses: Number(mov.totalExpenses),
      balance: Number(mov.balance),
      totalPaid: Number(mov.totalPaid),
      totalPending: Number(mov.totalPending),
      totalOverdue: Number(mov.totalOverdue),
    }));
  }

  async getDashboard(userId: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [
      financialSummary,
      creditCardsSummary,
      expensesByCategory,
      upcomingBills,
      overdueBills,
    ] = await Promise.all([
      this.getFinancialSummary(userId, currentMonth, currentYear),
      this.getCreditCardsSummary(userId),
      this.getExpensesByCategory(userId, currentMonth, currentYear),
      this.getUpcomingBills(userId, 7),
      this.getOverdueBills(userId),
    ]);

    return {
      month: currentMonth,
      year: currentYear,
      financialSummary,
      creditCardsSummary,
      expensesByCategory,
      upcomingBills,
      overdueBills,
    };
  }
}
