import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { AppointmentSource } from './schemas/appointment.schema';

@UseGuards(AuthGuard, TenantGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() dto: CreateAppointmentDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = {
      tenantId,
      userId: String(user?.uid ?? user?._id ?? user?.id ?? ''),
      userEmail: String(user?.email ?? ''),
    };
    return this.appointmentService.create(dto, tenantId, actor, AppointmentSource.DASHBOARD);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() queryDto: QueryAppointmentDto, @CurrentTenant() tenantId: string) {
    return this.appointmentService.findAll(queryDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.appointmentService.findOne(id, tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = {
      tenantId,
      userId: String(user?.uid ?? user?._id ?? user?.id ?? ''),
      userEmail: String(user?.email ?? ''),
    };
    return this.appointmentService.update(id, dto, tenantId, actor);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = {
      tenantId,
      userId: String(user?.uid ?? user?._id ?? user?.id ?? ''),
      userEmail: String(user?.email ?? ''),
    };
    return this.appointmentService.remove(id, tenantId, actor);
  }
}
