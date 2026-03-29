import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateAutomakerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  supportedModelYears?: number[];
}
