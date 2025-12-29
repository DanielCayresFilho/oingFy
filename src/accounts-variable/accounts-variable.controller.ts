import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AccountsVariableService } from './accounts-variable.service';
import { CreateAccountVariableDto } from './dto/create-account-variable.dto';
import { UpdateAccountVariableDto } from './dto/update-account-variable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts-variable')
@UseGuards(JwtAuthGuard)
export class AccountsVariableController {
  constructor(private readonly accountsVariableService: AccountsVariableService) {}

  @Post()
  create(@Request() req, @Body() createAccountVariableDto: CreateAccountVariableDto) {
    return this.accountsVariableService.create(req.user.userId, createAccountVariableDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.accountsVariableService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.accountsVariableService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateAccountVariableDto: UpdateAccountVariableDto) {
    return this.accountsVariableService.update(+id, req.user.userId, updateAccountVariableDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.accountsVariableService.remove(+id, req.user.userId);
  }

  @Post(':id/pay')
  payInstallment(@Request() req, @Param('id') id: string) {
    return this.accountsVariableService.payInstallment(+id, req.user.userId);
  }
}
