import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateAutomakerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  supportedModelYears?: number[];
}
