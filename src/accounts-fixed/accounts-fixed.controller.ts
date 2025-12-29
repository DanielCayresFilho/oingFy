import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AccountsFixedService } from './accounts-fixed.service';
import { CreateAccountFixedDto } from './dto/create-account-fixed.dto';
import { UpdateAccountFixedDto } from './dto/update-account-fixed.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts-fixed')
@UseGuards(JwtAuthGuard)
export class AccountsFixedController {
  constructor(private readonly accountsFixedService: AccountsFixedService) {}

  @Post()
  create(@Request() req, @Body() createAccountFixedDto: CreateAccountFixedDto) {
    return this.accountsFixedService.create(req.user.userId, createAccountFixedDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.accountsFixedService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.accountsFixedService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateAccountFixedDto: UpdateAccountFixedDto) {
    return this.accountsFixedService.update(+id, req.user.userId, updateAccountFixedDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.accountsFixedService.remove(+id, req.user.userId);
  }
}
