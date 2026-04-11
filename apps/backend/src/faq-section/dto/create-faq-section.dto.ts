import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FaqSectionStatus } from '../schemas/faq-section.schema';
import { FaqItemDto } from './faq-item.dto';

export class CreateFaqSectionDto {
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
  @IsEnum(FaqSectionStatus)
  status?: FaqSectionStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items: FaqItemDto[];
}
