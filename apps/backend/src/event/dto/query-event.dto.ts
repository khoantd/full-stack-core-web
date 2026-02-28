import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryEventDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  isPublished?: string;
}
