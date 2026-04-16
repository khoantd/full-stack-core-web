import { IsOptional, IsString, IsEnum, ValidateIf, IsMongoId, IsNotEmpty } from 'class-validator';
import { BlogStatus } from '../schemas/blog.schema';

export class UpdateBlogDto {
  // NOTE: Do not allow `null` here; it will bypass IsOptional and later fail Mongoose validation.
  @ValidateIf((_, v) => v !== undefined)
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title must not be empty' })
  title?: string;

  // NOTE: Do not allow `null` here; it will bypass IsOptional and later fail Mongoose validation.
  @ValidateIf((_, v) => v !== undefined)
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description must not be empty' })
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

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsMongoId()
  categoryId?: string | null;
}
