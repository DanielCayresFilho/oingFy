import { Controller, Get, Post, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MonthMovimentationService } from './month-movimentation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('month-movimentation')
@UseGuards(JwtAuthGuard)
export class MonthMovimentationController {
  constructor(private readonly monthMovimentationService: MonthMovimentationService) {}

  @Post('generate')
  generate(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.monthMovimentationService.generateMonthMovimentation(
      req.user.userId,
      +month,
      +year,
    );
  }

  @Post('update')
  update(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.monthMovimentationService.updateMonthMovimentation(
      req.user.userId,
      +month,
      +year,
    );
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
    return this.monthMovimentationService.findOne(req.user.userId, +month, +year);
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
