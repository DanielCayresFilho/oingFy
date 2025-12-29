import { Module } from '@nestjs/common';
import { MonthMovimentationService } from './month-movimentation.service';
import { MonthMovimentationController } from './month-movimentation.controller';

@Module({
  controllers: [MonthMovimentationController],
  providers: [MonthMovimentationService],
  exports: [MonthMovimentationService],
})
export class MonthMovimentationModule {}
