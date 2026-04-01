import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { Attendee, AttendeeDocument, AttendeeStatus } from './schemas/attendee.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Attendee.name) private attendeeModel: Model<AttendeeDocument>,
  ) {}

  async create(createEventDto: CreateEventDto, tenantId: string): Promise<Event> {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);
    if (endDate < startDate) throw new BadRequestException('End date must be after start date');

    const createdEvent = new this.eventModel({ ...createEventDto, tenantId: new Types.ObjectId(tenantId) });
    return await createdEvent.save();
  }

  async findAll(queryDto: QueryEventDto, tenantId: string) {
    const { page = '1', limit = '10', search, isPublished } = queryDto;
    const query: any = { tenantId: new Types.ObjectId(tenantId) };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (isPublished !== undefined && isPublished !== null && isPublished !== '') {
      query.isPublished = isPublished === 'true';
    }

    if (page === 'all') {
      const data = await this.eventModel.find(query).sort({ createdAt: -1 }).exec();
      return { data, pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.eventModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), hasNextPage: pageNum < Math.ceil(total / limitNum), hasPrevPage: pageNum > 1 },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Event> {
    const event = await this.eventModel.findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) }).exec();
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, tenantId: string): Promise<Event> {
    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (new Date(updateEventDto.endDate) < new Date(updateEventDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (updateEventDto.startDate || updateEventDto.endDate) {
      const existingEvent = await this.eventModel.findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) }).exec();
      if (!existingEvent) throw new NotFoundException(`Event with ID ${id} not found`);

      const startDate = updateEventDto.startDate ? new Date(updateEventDto.startDate) : existingEvent.startDate;
      const endDate = updateEventDto.endDate ? new Date(updateEventDto.endDate) : existingEvent.endDate;
      if (endDate < startDate) throw new BadRequestException('End date must be after start date');
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { _id: id, tenantId: new Types.ObjectId(tenantId) },
      updateEventDto,
      { new: true },
    ).exec();
    if (!updatedEvent) throw new NotFoundException(`Event with ID ${id} not found`);
    return updatedEvent;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const event = await this.eventModel.findOneAndDelete({ _id: id, tenantId: new Types.ObjectId(tenantId) }).exec();
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    await this.attendeeModel.deleteMany({ event: id }).exec();
  }

  // Attendee management
  async getAttendees(eventId: string, tenantId: string) {
    const event = await this.eventModel.findOne({ _id: eventId, tenantId: new Types.ObjectId(tenantId) }).exec();
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    return this.attendeeModel.find({ event: eventId }).sort({ createdAt: -1 }).exec();
  }

  async registerAttendee(eventId: string, tenantId: string, data: { name: string; email: string }) {
    const event = await this.eventModel.findOne({ _id: eventId, tenantId: new Types.ObjectId(tenantId) }).exec();
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);

    const existing = await this.attendeeModel.findOne({ event: eventId, email: data.email }).exec();
    if (existing) throw new BadRequestException('This email is already registered for this event');

    const registeredCount = await this.attendeeModel.countDocuments({ event: eventId, status: AttendeeStatus.REGISTERED }).exec();

    let status = AttendeeStatus.REGISTERED;
    if (event.capacity && registeredCount >= event.capacity) {
      if (!event.waitlistEnabled) throw new BadRequestException('Event is at full capacity');
      status = AttendeeStatus.WAITLISTED;
    }

    return this.attendeeModel.create({ event: eventId, name: data.name, email: data.email, status });
  }

  async updateAttendeeStatus(eventId: string, attendeeId: string, status: AttendeeStatus) {
    const attendee = await this.attendeeModel.findOne({ _id: attendeeId, event: eventId }).exec();
    if (!attendee) throw new NotFoundException('Attendee not found');
    attendee.status = status;
    return attendee.save();
  }

  async exportAttendees(eventId: string, tenantId: string): Promise<string> {
    const attendees = await this.getAttendees(eventId, tenantId);
    const header = 'Name,Email,Status,Registered At\n';
    const rows = attendees.map(a => `"${a.name}","${a.email}","${a.status}","${a.createdAt.toISOString()}"`).join('\n');
    return header + rows;
  }
}
