import { IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateCreditCardDto {
  @IsString()
  name: string;

  @IsDateString()
  vencibleAt: string;

  @IsNumber()
  @Min(0)
  totalLimite: number;
}
