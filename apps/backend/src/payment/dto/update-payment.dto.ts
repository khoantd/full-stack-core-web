import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsEnum,
  Min,
  IsMongoId,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../schemas/payment.schema';

export class UpdatePaymentDto {
  @IsMongoId()
  @IsOptional()
  event?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;
}
