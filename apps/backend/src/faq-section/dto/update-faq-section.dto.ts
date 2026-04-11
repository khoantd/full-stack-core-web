import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FaqSectionStatus } from '../schemas/faq-section.schema';
import { FaqItemDto } from './faq-item.dto';

export class UpdateFaqSectionDto {
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
  @IsEnum(FaqSectionStatus)
  status?: FaqSectionStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items?: FaqItemDto[];
}
