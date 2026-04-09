import { IsOptional, IsString } from 'class-validator';

export class QueryServiceDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  /**
   * Comma-separated list of category ids, e.g. "id1,id2".
   * Kept as string here; parsing happens in service layer.
   */
  @IsOptional()
  @IsString()
  categoryIds?: string;
}
