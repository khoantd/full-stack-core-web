import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryPaymentDto {
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
  eventId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
