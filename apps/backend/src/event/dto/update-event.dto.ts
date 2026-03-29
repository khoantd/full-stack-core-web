import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { RegistrationType } from '../schemas/event.schema';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsEnum(RegistrationType)
  @IsOptional()
  registrationType?: RegistrationType;

  @IsBoolean()
  @IsOptional()
  waitlistEnabled?: boolean;
}
