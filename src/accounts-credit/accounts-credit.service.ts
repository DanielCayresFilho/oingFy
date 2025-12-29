import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountCreditDto } from './dto/create-account-credit.dto';
import { UpdateAccountCreditDto } from './dto/update-account-credit.dto';

@Injectable()
export class AccountsCreditService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createAccountCreditDto: CreateAccountCreditDto) {
    const card = await this.prisma.creditCard.findFirst({
      where: {
        id: createAccountCreditDto.cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    // Converter purchaseDate se presente
    const data: any = { ...createAccountCreditDto };
    if (data.purchaseDate) {
      const purchaseDateObj = new Date(data.purchaseDate);
      if (isNaN(purchaseDateObj.getTime())) {
        throw new Error('Data de compra inválida');
      }
      data.purchaseDate = purchaseDateObj;
    } else {
      data.purchaseDate = new Date(); // Data atual se não fornecida
    }

    return this.prisma.accountCredit.create({
      data,
      include: {
        card: true,
        category: true,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.accountCredit.findMany({
      where: {
        card: {
          userId,
        },
      },
      include: {
        card: true,
        category: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });
  }

  findByCard(cardId: number, userId: number) {
    return this.prisma.accountCredit.findMany({
      where: {
        cardId,
        card: {
          userId,
        },
      },
      include: {
        card: true,
        category: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    return this.prisma.accountCredit.findFirst({
      where: {
        id,
        card: {
          userId,
        },
      },
      include: {
        card: true,
        category: true,
      },
    });
  }

  async update(id: number, userId: number, updateAccountCreditDto: UpdateAccountCreditDto) {
    const account = await this.findOne(id, userId);

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    // Converter purchaseDate se presente
    const data: any = { ...updateAccountCreditDto };
    if (data.purchaseDate) {
      const purchaseDateObj = new Date(data.purchaseDate);
      if (isNaN(purchaseDateObj.getTime())) {
        throw new Error('Data de compra inválida');
      }
      data.purchaseDate = purchaseDateObj;
    }

    return this.prisma.accountCredit.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number) {
    const account = await this.findOne(id, userId);

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    return this.prisma.accountCredit.delete({
      where: { id },
    });
  }

  async payInstallment(id: number, userId: number) {
    const account = await this.findOne(id, userId);

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    if (account.installmentsPayed >= account.installments) {
      throw new Error('Todas as parcelas já foram pagas');
    }

    return this.prisma.accountCredit.update({
      where: { id },
      data: {
        installmentsPayed: account.installmentsPayed + 1,
      },
    });
  }
}
