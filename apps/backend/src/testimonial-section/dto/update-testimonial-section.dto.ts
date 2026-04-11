import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TestimonialSectionStatus } from '../schemas/testimonial-section.schema';
import { TestimonialItemDto } from './testimonial-item.dto';

export class UpdateTestimonialSectionDto {
  @IsOptional()
  @IsString()
  eyebrow?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(TestimonialSectionStatus)
  status?: TestimonialSectionStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialItemDto)
  items?: TestimonialItemDto[];
}
