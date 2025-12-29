import { Controller, Get, Post, Param, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { MonthMovimentationService } from './month-movimentation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('month-movimentation')
@UseGuards(JwtAuthGuard)
export class MonthMovimentationController {
  constructor(private readonly monthMovimentationService: MonthMovimentationService) {}

  @Post('generate')
  async generate(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const monthNum = +month;
    const yearNum = +year;

    if (!month || !year || isNaN(monthNum) || isNaN(yearNum)) {
      throw new BadRequestException('Mês e ano são obrigatórios');
    }

    if (monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Mês deve estar entre 1 e 12');
    }

    try {
      return await this.monthMovimentationService.generateMonthMovimentation(
        req.user.userId,
        monthNum,
        yearNum,
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Erro ao gerar movimentação mensal');
    }
  }

  @Post('update')
  async update(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const monthNum = +month;
    const yearNum = +year;

    if (!month || !year || isNaN(monthNum) || isNaN(yearNum)) {
      throw new BadRequestException('Mês e ano são obrigatórios');
    }

    if (monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Mês deve estar entre 1 e 12');
    }

    try {
      return await this.monthMovimentationService.updateMonthMovimentation(
        req.user.userId,
        monthNum,
        yearNum,
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Erro ao atualizar movimentação mensal');
    }
  }

  @Get()
  findAll(@Request() req) {
    return this.monthMovimentationService.findAll(req.user.userId);
  }

  @Get('by-month')
  findOne(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const monthNum = +month;
    const yearNum = +year;

    if (!month || !year || isNaN(monthNum) || isNaN(yearNum)) {
      throw new BadRequestException('Mês e ano são obrigatórios');
    }

    if (monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Mês deve estar entre 1 e 12');
    }

    return this.monthMovimentationService.findOne(req.user.userId, monthNum, yearNum);
  }

  @Get('by-category')
  getByCategory(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.monthMovimentationService.getItemsByCategory(
      req.user.userId,
      +month,
      +year,
    );
  }

  @Post('items/:itemId/pay')
  payItem(@Request() req, @Param('itemId') itemId: string) {
    return this.monthMovimentationService.payItem(req.user.userId, +itemId);
  }

  @Post('items/:itemId/unpay')
  unpayItem(@Request() req, @Param('itemId') itemId: string) {
    return this.monthMovimentationService.unpayItem(req.user.userId, +itemId);
  }
}
