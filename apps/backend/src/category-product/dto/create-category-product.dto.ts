import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCategoryProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
