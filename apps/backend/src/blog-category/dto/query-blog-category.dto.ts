import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryBlogCategoryDto {
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
  @IsString()
  status?: string;
}
