import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestimonialSectionStatus } from '../schemas/testimonial-section.schema';
import { TestimonialItemDto } from './testimonial-item.dto';

export class CreateTestimonialSectionDto {
  @IsNotEmpty()
  @IsString()
  eyebrow: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(TestimonialSectionStatus)
  status?: TestimonialSectionStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialItemDto)
  items: TestimonialItemDto[];
}
