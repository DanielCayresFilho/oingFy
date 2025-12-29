import { IsString, IsNumber, IsInt, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateAccountCreditDto {
  @IsInt()
  cardId: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  installmentsPrice: number;

  @IsInt()
  @Min(1)
  installments: number;

  @IsInt()
  categoryId: number;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;
}
