import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryCategoryProductDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
