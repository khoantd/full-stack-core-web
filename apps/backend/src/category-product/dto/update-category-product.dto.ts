import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
