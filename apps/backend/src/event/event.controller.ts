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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { AttendeeStatus } from './schemas/attendee.schema';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() queryDto: QueryEventDto) {
    return this.eventService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }

  // Attendee management
  @Get(':id/attendees')
  getAttendees(@Param('id') id: string) {
    return this.eventService.getAttendees(id);
  }

  @Post(':id/attendees')
  registerAttendee(@Param('id') id: string, @Body() body: { name: string; email: string }) {
    return this.eventService.registerAttendee(id, body);
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
  async exportAttendees(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.eventService.exportAttendees(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees-${id}.csv"`);
    res.send(csv);
  }
}
