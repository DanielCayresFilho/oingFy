import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountFixedDto } from './dto/create-account-fixed.dto';
import { UpdateAccountFixedDto } from './dto/update-account-fixed.dto';

@Injectable()
export class AccountsFixedService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createAccountFixedDto: CreateAccountFixedDto) {
    return this.prisma.accountFixed.create({
      data: {
        ...createAccountFixedDto,
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
    return this.prisma.accountFixed.updateMany({
      where: { id, userId },
      data: updateAccountFixedDto,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.accountFixed.deleteMany({
      where: { id, userId },
    });
  }
}
