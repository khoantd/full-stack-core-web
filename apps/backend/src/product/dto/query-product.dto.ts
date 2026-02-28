import { IsOptional, IsString, IsNumberString, IsMongoId } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}
