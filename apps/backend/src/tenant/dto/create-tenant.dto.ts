import { IsString, IsOptional, MinLength, Matches, IsArray, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ALL_FEATURES, FeatureKey } from '../schemas/tenant.schema';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '') : value)
  slug: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsArray()
  @IsIn([...ALL_FEATURES], { each: true })
  enabledFeatures?: FeatureKey[];
}
