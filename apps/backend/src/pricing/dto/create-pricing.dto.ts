import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PricingStatus } from '../schemas/pricing.schema';
import { PricingTierDto } from './pricing-tier.dto';

export class CreatePricingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  tiers: PricingTierDto[];
}

