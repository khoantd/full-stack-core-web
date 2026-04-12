import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { PublicIntegrationAuthGuard } from 'src/guards/public-integration-auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RequestPublicAppointmentDto } from './dto/request-public-appointment.dto';
import { AppointmentSource } from './schemas/appointment.schema';

@Controller('public/appointments')
export class AppointmentPublicController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('request')
  @UsePipes(new ValidationPipe({ transform: true }))
  createRequest(@Body() dto: RequestPublicAppointmentDto) {
    return this.appointmentService.createPublicRequest(dto);
  }

  @Post()
  @UseGuards(PublicIntegrationAuthGuard, TenantGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  createIntegration(@Body() dto: CreateAppointmentDto, @CurrentTenant() tenantId: string) {
    return this.appointmentService.create(dto, tenantId, AppointmentSource.INTEGRATION);
  }
}
