import { Module } from '@nestjs/common';
import { AccountsVariableService } from './accounts-variable.service';
import { AccountsVariableController } from './accounts-variable.controller';

@Module({
  controllers: [AccountsVariableController],
  providers: [AccountsVariableService],
  exports: [AccountsVariableService],
})
export class AccountsVariableModule {}
