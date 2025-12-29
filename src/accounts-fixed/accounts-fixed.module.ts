import { Module } from '@nestjs/common';
import { AccountsFixedService } from './accounts-fixed.service';
import { AccountsFixedController } from './accounts-fixed.controller';

@Module({
  controllers: [AccountsFixedController],
  providers: [AccountsFixedService],
  exports: [AccountsFixedService],
})
export class AccountsFixedModule {}
