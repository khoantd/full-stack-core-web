import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '../schemas/payment.schema';

export class UpdateStatusDto {
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;
}
