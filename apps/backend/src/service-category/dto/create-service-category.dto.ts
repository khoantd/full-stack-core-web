import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ServiceCategoryStatus } from '../schemas/service-category.schema';

export class CreateServiceCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  slug: string;

  @IsOptional()
  @IsEnum(ServiceCategoryStatus)
  status?: ServiceCategoryStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parent?: string;
}

