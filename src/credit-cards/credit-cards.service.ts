import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createCreditCardDto: CreateCreditCardDto) {
    return this.prisma.creditCard.create({
      data: {
        ...createCreditCardDto,
        userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.creditCard.findMany({
      where: { userId },
      include: {
        accountsCredit: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.creditCard.findFirst({
      where: { id, userId },
      include: {
        accountsCredit: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  update(id: number, userId: number, updateCreditCardDto: UpdateCreditCardDto) {
    return this.prisma.creditCard.updateMany({
      where: { id, userId },
      data: updateCreditCardDto,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.creditCard.deleteMany({
      where: { id, userId },
    });
  }

  async getAvailableLimit(id: number, userId: number) {
    const card = await this.findOne(id, userId);

    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    const totalUsed = card.accountsCredit.reduce((sum, account) => {
      const remainingInstallments = account.installments - account.installmentsPayed;
      return sum + Number(account.installmentsPrice) * remainingInstallments;
    }, 0);

    return {
      totalLimit: Number(card.totalLimite),
      usedLimit: totalUsed,
      availableLimit: Number(card.totalLimite) - totalUsed,
    };
  }
}
