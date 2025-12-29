import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountCreditDto } from './create-account-credit.dto';

export class UpdateAccountCreditDto extends PartialType(CreateAccountCreditDto) {}
