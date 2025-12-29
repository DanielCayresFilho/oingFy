import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountFixedDto } from './dto/create-account-fixed.dto';
import { UpdateAccountFixedDto } from './dto/update-account-fixed.dto';

@Injectable()
export class AccountsFixedService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createAccountFixedDto: CreateAccountFixedDto) {
    // Converter vencibleAt para DateTime completo
    const vencibleAtDate = new Date(createAccountFixedDto.vencibleAt);
    if (isNaN(vencibleAtDate.getTime())) {
      throw new Error('Data de vencimento inválida');
    }
    
    return this.prisma.accountFixed.create({
      data: {
        ...createAccountFixedDto,
        vencibleAt: vencibleAtDate,
        userId,
      },
      include: {
        category: true,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.accountFixed.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { vencibleAt: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.accountFixed.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });
  }

  update(id: number, userId: number, updateAccountFixedDto: UpdateAccountFixedDto) {
    // Converter vencibleAt se presente
    const data: any = { ...updateAccountFixedDto };
    if (data.vencibleAt) {
      const vencibleAtDate = new Date(data.vencibleAt);
      if (isNaN(vencibleAtDate.getTime())) {
        throw new Error('Data de vencimento inválida');
      }
      data.vencibleAt = vencibleAtDate;
    }
    
    return this.prisma.accountFixed.updateMany({
      where: { id, userId },
      data,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.accountFixed.deleteMany({
      where: { id, userId },
    });
  }
}
