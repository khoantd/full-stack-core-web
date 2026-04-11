import { IsNotEmpty, IsString } from 'class-validator';

export class PricingFaqItemDto {
  @IsNotEmpty()
  @IsString()
  q: string;

  @IsNotEmpty()
  @IsString()
  a: string;
}
