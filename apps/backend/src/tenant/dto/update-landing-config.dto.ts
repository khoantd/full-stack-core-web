import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateLandingConfigDto {
  @IsOptional() @IsString() siteName?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() hours?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() twitter?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() theme?: string;
  @IsOptional() @IsBoolean() heroEnabled?: boolean;
  @IsOptional() @IsBoolean() categoriesEnabled?: boolean;
  @IsOptional() @IsBoolean() statsEnabled?: boolean;
  @IsOptional() @IsBoolean() aboutEnabled?: boolean;
  @IsOptional() @IsBoolean() productsEnabled?: boolean;
  @IsOptional() @IsBoolean() testimonialsEnabled?: boolean;
  @IsOptional() @IsBoolean() blogsEnabled?: boolean;
  @IsOptional() @IsBoolean() contactEnabled?: boolean;
}
