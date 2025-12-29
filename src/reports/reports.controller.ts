import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.reportsService.getDashboard(req.user.userId);
  }

  @Get('financial-summary')
  getFinancialSummary(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const currentDate = new Date();
    const currentMonth = month ? +month : currentDate.getMonth() + 1;
    const currentYear = year ? +year : currentDate.getFullYear();

    return this.reportsService.getFinancialSummary(req.user.userId, currentMonth, currentYear);
  }

  @Get('credit-cards-summary')
  getCreditCardsSummary(@Request() req) {
    return this.reportsService.getCreditCardsSummary(req.user.userId);
  }

  @Get('expenses-by-category')
  getExpensesByCategory(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const currentDate = new Date();
    const currentMonth = month ? +month : currentDate.getMonth() + 1;
    const currentYear = year ? +year : currentDate.getFullYear();

    return this.reportsService.getExpensesByCategory(req.user.userId, currentMonth, currentYear);
  }

  @Get('upcoming-bills')
  getUpcomingBills(@Request() req, @Query('days') days?: string) {
    const daysAhead = days ? +days : 7;
    return this.reportsService.getUpcomingBills(req.user.userId, daysAhead);
  }

  @Get('overdue-bills')
  getOverdueBills(@Request() req) {
    return this.reportsService.getOverdueBills(req.user.userId);
  }

  @Get('yearly-comparison')
  getYearlyComparison(@Request() req, @Query('year') year?: string) {
    const currentYear = year ? +year : new Date().getFullYear();
    return this.reportsService.getYearlyComparison(req.user.userId, currentYear);
  }
}
