import { Module } from '@nestjs/common';
import { AccountsCreditService } from './accounts-credit.service';
import { AccountsCreditController } from './accounts-credit.controller';

@Module({
  controllers: [AccountsCreditController],
  providers: [AccountsCreditService],
  exports: [AccountsCreditService],
})
export class AccountsCreditModule {}
