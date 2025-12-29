import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AccountsCreditService } from './accounts-credit.service';
import { CreateAccountCreditDto } from './dto/create-account-credit.dto';
import { UpdateAccountCreditDto } from './dto/update-account-credit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts-credit')
@UseGuards(JwtAuthGuard)
export class AccountsCreditController {
  constructor(private readonly accountsCreditService: AccountsCreditService) {}

  @Post()
  create(@Request() req, @Body() createAccountCreditDto: CreateAccountCreditDto) {
    return this.accountsCreditService.create(req.user.userId, createAccountCreditDto);
  }

  @Get()
  findAll(@Request() req, @Query('cardId') cardId?: string) {
    if (cardId) {
      return this.accountsCreditService.findByCard(+cardId, req.user.userId);
    }
    return this.accountsCreditService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.accountsCreditService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateAccountCreditDto: UpdateAccountCreditDto) {
    return this.accountsCreditService.update(+id, req.user.userId, updateAccountCreditDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.accountsCreditService.remove(+id, req.user.userId);
  }

  @Post(':id/pay')
  payInstallment(@Request() req, @Param('id') id: string) {
    return this.accountsCreditService.payInstallment(+id, req.user.userId);
  }
}
