import { Module } from '@nestjs/common';
import { MoneyEntriesService } from './money-entries.service';
import { MoneyEntriesController } from './money-entries.controller';

@Module({
  controllers: [MoneyEntriesController],
  providers: [MoneyEntriesService],
  exports: [MoneyEntriesService],
})
export class MoneyEntriesModule {}
