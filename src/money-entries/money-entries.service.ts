import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoneyEntryDto } from './dto/create-money-entry.dto';
import { UpdateMoneyEntryDto } from './dto/update-money-entry.dto';

@Injectable()
export class MoneyEntriesService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createMoneyEntryDto: CreateMoneyEntryDto) {
    return this.prisma.moneyEntry.create({
      data: {
        ...createMoneyEntryDto,
        userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.moneyEntry.findMany({
      where: { userId },
      orderBy: { entryDate: 'desc' },
    });
  }

  findByMonth(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.moneyEntry.findMany({
      where: {
        userId,
        entryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { entryDate: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.moneyEntry.findFirst({
      where: { id, userId },
    });
  }

  update(id: number, userId: number, updateMoneyEntryDto: UpdateMoneyEntryDto) {
    return this.prisma.moneyEntry.updateMany({
      where: { id, userId },
      data: updateMoneyEntryDto,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.moneyEntry.deleteMany({
      where: { id, userId },
    });
  }

  async getTotalByMonth(userId: number, month: number, year: number) {
    const entries = await this.findByMonth(userId, month, year);

    const total = entries.reduce((sum, entry) => {
      return sum + Number(entry.amount);
    }, 0);

    return {
      month,
      year,
      total,
      entries,
    };
  }
}
