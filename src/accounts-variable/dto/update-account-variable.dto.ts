import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountVariableDto } from './create-account-variable.dto';

export class UpdateAccountVariableDto extends PartialType(CreateAccountVariableDto) {}
