import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BlogCategoryStatus } from '../schemas/blog-category.schema';

export class UpdateBlogCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  slug?: string;

  @IsOptional()
  @IsEnum(BlogCategoryStatus)
  status?: BlogCategoryStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parent?: string | null;
}
