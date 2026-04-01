import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './schemas/event.schema';
import { Attendee, AttendeeSchema } from './schemas/attendee.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Attendee.name, schema: AttendeeSchema },
    ]),
    TenantModule,
  ],
  controllers: [EventController],
  providers: [EventService, TenantGuard],
  exports: [EventService],
})
export class EventModule {}
