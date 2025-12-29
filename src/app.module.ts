import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { AccountsFixedModule } from './accounts-fixed/accounts-fixed.module';
import { AccountsVariableModule } from './accounts-variable/accounts-variable.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { AccountsCreditModule } from './accounts-credit/accounts-credit.module';
import { MoneyEntriesModule } from './money-entries/money-entries.module';
import { MonthMovimentationModule } from './month-movimentation/month-movimentation.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    AccountsFixedModule,
    AccountsVariableModule,
    CreditCardsModule,
    AccountsCreditModule,
    MoneyEntriesModule,
    MonthMovimentationModule,
    ReportsModule,
  ],
})
export class AppModule {}
