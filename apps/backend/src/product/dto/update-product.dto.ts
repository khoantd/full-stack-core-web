import { IsString, IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsMongoId()
  @IsOptional()
  category?: string;
}
