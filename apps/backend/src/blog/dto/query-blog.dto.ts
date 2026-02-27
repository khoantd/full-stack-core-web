import { IsOptional, IsString } from 'class-validator';

export class QueryBlogDto {
  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;
}
