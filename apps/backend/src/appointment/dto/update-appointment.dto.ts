import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AppointmentCustomerDto } from './appointment-customer.dto';
import { AppointmentStatus } from '../schemas/appointment.schema';

export class UpdateAppointmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ValidateNested()
  @Type(() => AppointmentCustomerDto)
  @IsOptional()
  customer?: AppointmentCustomerDto;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  serviceId?: string;
}
