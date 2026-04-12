import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppointmentCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
