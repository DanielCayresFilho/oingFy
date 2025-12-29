import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.category.findFirst({
      where: { id, userId },
    });
  }

  update(id: number, userId: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.updateMany({
      where: { id, userId },
      data: updateCategoryDto,
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.category.deleteMany({
      where: { id, userId },
    });
  }
}
