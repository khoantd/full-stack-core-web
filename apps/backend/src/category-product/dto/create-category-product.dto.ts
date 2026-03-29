import { IsString, IsOptional, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateCategoryProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  parent?: string;
}
