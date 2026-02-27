import { IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string;
}
