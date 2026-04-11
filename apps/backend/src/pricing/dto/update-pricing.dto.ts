import {
  Allow,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PricingStatus } from '../schemas/pricing.schema';
import { PricingFaqItemDto } from './pricing-faq-item.dto';
import { PricingTierDto } from './pricing-tier.dto';

export class UpdatePricingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  tiers?: PricingTierDto[];

  @IsOptional()
  @IsString()
  faqEyebrow?: string;

  @IsOptional()
  @IsString()
  faqTitle?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingFaqItemDto)
  faqs?: PricingFaqItemDto[];

  @IsOptional()
  @IsString()
  homeFaqEyebrow?: string;

  @IsOptional()
  @IsString()
  homeFaqTitle?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingFaqItemDto)
  homeFaqs?: PricingFaqItemDto[];

  @IsOptional()
  @Allow()
  translations?: Record<string, Record<string, unknown>>;
}

