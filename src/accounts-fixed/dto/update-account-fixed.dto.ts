import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountFixedDto } from './create-account-fixed.dto';

export class UpdateAccountFixedDto extends PartialType(CreateAccountFixedDto) {}
