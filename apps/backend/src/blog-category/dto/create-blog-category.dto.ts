import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BlogCategoryStatus } from '../schemas/blog-category.schema';

export class CreateBlogCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  slug: string;

  @IsOptional()
  @IsEnum(BlogCategoryStatus)
  status?: BlogCategoryStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parent?: string;
}
