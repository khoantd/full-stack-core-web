import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class UpdateCategoryProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  parent?: string | null;
}
