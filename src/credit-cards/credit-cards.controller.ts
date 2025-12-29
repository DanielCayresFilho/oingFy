import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('credit-cards')
@UseGuards(JwtAuthGuard)
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  create(@Request() req, @Body() createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardsService.create(req.user.userId, createCreditCardDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.creditCardsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.creditCardsService.findOne(+id, req.user.userId);
  }

  @Get(':id/available-limit')
  getAvailableLimit(@Request() req, @Param('id') id: string) {
    return this.creditCardsService.getAvailableLimit(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateCreditCardDto: UpdateCreditCardDto) {
    return this.creditCardsService.update(+id, req.user.userId, updateCreditCardDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.creditCardsService.remove(+id, req.user.userId);
  }
}
