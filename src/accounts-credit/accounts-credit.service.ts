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

    return this.prisma.accountCredit.create({
      data: createAccountCreditDto,
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

    return this.prisma.accountCredit.update({
      where: { id },
      data: updateAccountCreditDto,
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
