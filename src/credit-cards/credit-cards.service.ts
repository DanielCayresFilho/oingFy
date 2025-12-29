import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createCreditCardDto: CreateCreditCardDto) {
    // Converter vencibleAt para DateTime completo
    // Se vier como "YYYY-MM-DD", converter para DateTime ISO-8601
    const vencibleAtDate = new Date(createCreditCardDto.vencibleAt);
    if (isNaN(vencibleAtDate.getTime())) {
      throw new Error('Data de vencimento inválida');
    }
    
    return this.prisma.creditCard.create({
      data: {
        ...createCreditCardDto,
        vencibleAt: vencibleAtDate,
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
    // Converter vencibleAt se presente
    const data: any = { ...updateCreditCardDto };
    if (data.vencibleAt) {
      const vencibleAtDate = new Date(data.vencibleAt);
      if (isNaN(vencibleAtDate.getTime())) {
        throw new Error('Data de vencimento inválida');
      }
      data.vencibleAt = vencibleAtDate;
    }
    
    return this.prisma.creditCard.updateMany({
      where: { id, userId },
      data,
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
