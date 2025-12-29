import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MoneyEntriesService } from './money-entries.service';
import { CreateMoneyEntryDto } from './dto/create-money-entry.dto';
import { UpdateMoneyEntryDto } from './dto/update-money-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('money-entries')
@UseGuards(JwtAuthGuard)
export class MoneyEntriesController {
  constructor(private readonly moneyEntriesService: MoneyEntriesService) {}

  @Post()
  create(@Request() req, @Body() createMoneyEntryDto: CreateMoneyEntryDto) {
    return this.moneyEntriesService.create(req.user.userId, createMoneyEntryDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.moneyEntriesService.findAll(req.user.userId);
  }

  @Get('by-month')
  findByMonth(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.moneyEntriesService.findByMonth(req.user.userId, +month, +year);
  }

  @Get('total-by-month')
  getTotalByMonth(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.moneyEntriesService.getTotalByMonth(req.user.userId, +month, +year);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.moneyEntriesService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateMoneyEntryDto: UpdateMoneyEntryDto) {
    return this.moneyEntriesService.update(+id, req.user.userId, updateMoneyEntryDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.moneyEntriesService.remove(+id, req.user.userId);
  }
}
