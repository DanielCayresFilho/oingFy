import { IsString, IsDateString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateAccountFixedDto {
  @IsString()
  name: string;

  @IsDateString()
  vencibleAt: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  categoryId: number;
}
