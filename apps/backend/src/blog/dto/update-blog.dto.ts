import { IsOptional, IsString, IsEnum, ValidateIf } from 'class-validator';
import { BlogStatus } from '../schemas/blog.schema';

export class UpdateBlogDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString({ message: 'Image must be a string' })
  image?: string | null;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}
