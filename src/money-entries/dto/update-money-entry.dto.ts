import { PartialType } from '@nestjs/mapped-types';
import { CreateMoneyEntryDto } from './create-money-entry.dto';

export class UpdateMoneyEntryDto extends PartialType(CreateMoneyEntryDto) {}
