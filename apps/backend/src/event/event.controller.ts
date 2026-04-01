import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { AttendeeStatus } from './schemas/attendee.schema';

@UseGuards(AuthGuard, TenantGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEventDto: CreateEventDto, @CurrentTenant() tenantId: string) {
    return this.eventService.create(createEventDto, tenantId);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() queryDto: QueryEventDto, @CurrentTenant() tenantId: string) {
    return this.eventService.findAll(queryDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.eventService.findOne(id, tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @CurrentTenant() tenantId: string) {
    return this.eventService.update(id, updateEventDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.eventService.remove(id, tenantId);
  }

  // Attendee management
  @Get(':id/attendees')
  getAttendees(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.eventService.getAttendees(id, tenantId);
  }

  @Post(':id/attendees')
  registerAttendee(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() body: { name: string; email: string },
  ) {
    return this.eventService.registerAttendee(id, tenantId, body);
  }

  @Put(':id/attendees/:attendeeId/status')
  updateAttendeeStatus(
    @Param('id') id: string,
    @Param('attendeeId') attendeeId: string,
    @Body() body: { status: AttendeeStatus },
  ) {
    return this.eventService.updateAttendeeStatus(id, attendeeId, body.status);
  }

  @Get(':id/attendees/export')
  async exportAttendees(@Param('id') id: string, @CurrentTenant() tenantId: string, @Res() res: Response) {
    const csv = await this.eventService.exportAttendees(id, tenantId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees-${id}.csv"`);
    res.send(csv);
  }
}
