import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { AppointmentCustomerDto } from './appointment-customer.dto';

export class RequestPublicAppointmentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'tenantSlug must be a valid slug' })
  tenantSlug: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @ValidateNested()
  @Type(() => AppointmentCustomerDto)
  customer: AppointmentCustomerDto;

  @IsString()
  @IsOptional()
  notes?: string;
}
