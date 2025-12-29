import { IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateMoneyEntryDto {
  @IsString()
  name: string;

  @IsDateString()
  entryDate: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
