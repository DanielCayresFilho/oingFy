import { IsString, IsDateString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateAccountVariableDto {
  @IsString()
  name: string;

  @IsDateString()
  vencibleAt: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  categoryId: number;
}
