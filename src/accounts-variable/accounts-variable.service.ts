import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountVariableDto } from './dto/create-account-variable.dto';
import { UpdateAccountVariableDto } from './dto/update-account-variable.dto';

@Injectable()
export class AccountsVariableService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createAccountVariableDto: CreateAccountVariableDto) {
    // Converter vencibleAt para DateTime completo
    const vencibleAtDate = new Date(createAccountVariableDto.vencibleAt);
    if (isNaN(vencibleAtDate.getTime())) {
      throw new Error('Data de vencimento inválida');
    }
    
    return this.prisma.accountVariable.create({
      data: {
        ...createAccountVariableDto,
        vencibleAt: vencibleAtDate,
        userId,
      },
      include: {
        category: true,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.accountVariable.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { vencibleAt: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.accountVariable.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });
  }

  update(id: number, userId: number, updateAccountVariableDto: UpdateAccountVariableDto) {
    // Converter vencibleAt se presente
    const data: any = { ...updateAccountVariableDto };
    if (data.vencibleAt) {
      const vencibleAtDate = new Date(data.vencibleAt);
      if (isNaN(vencibleAtDate.getTime())) {
        throw new Error('Data de vencimento inválida');
      }
      data.vencibleAt = vencibleAtDate;
    }
    
    return this.prisma.accountVariable.updateMany({
      where: { id, userId },
      data,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.accountVariable.deleteMany({
      where: { id, userId },
    });
  }

  async payInstallment(id: number, userId: number) {
    const account = await this.findOne(id, userId);

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    if (account.qtPayed >= account.quantity) {
      throw new Error('Todas as parcelas já foram pagas');
    }

    return this.prisma.accountVariable.updateMany({
      where: { id, userId },
      data: {
        qtPayed: account.qtPayed + 1,
      },
    });
  }
}
