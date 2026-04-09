import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceContentBlockDto {
  @IsString()
  @IsIn(['heading', 'paragraph', 'bullets', 'image'])
  type: 'heading' | 'paragraph' | 'bullets' | 'image';

  // heading / paragraph
  @IsOptional()
  @IsString()
  text?: string;

  // heading
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  level?: number;

  // bullets
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items?: string[];

  // image
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

export class ServiceContentDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceContentBlockDto)
  blocks?: ServiceContentBlockDto[];
}

