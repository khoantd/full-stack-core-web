import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentController } from './appointment.controller';
import { AppointmentPublicController } from './appointment-public.controller';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';
import { ApiKeyModule } from '../api-key/api-key.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    TenantModule,
    ApiKeyModule,
  ],
  controllers: [AppointmentController, AppointmentPublicController],
  providers: [AppointmentService, TenantGuard],
  exports: [AppointmentService],
})
export class AppointmentModule {}
