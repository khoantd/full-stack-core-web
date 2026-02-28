import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validate that endDate is after startDate
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const createdEvent = new this.eventModel(createEventDto);
    return await createdEvent.save();
  }

  async findAll(queryDto: QueryEventDto) {
    const { page = '1', limit = '10', search, isPublished } = queryDto;
    const query: any = {};

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter by isPublished
    if (isPublished !== undefined && isPublished !== null && isPublished !== '') {
      query.isPublished = isPublished === 'true';
    }

    // Handle page=all
    if (page === 'all') {
      const data = await this.eventModel
        .find(query)
        .sort({ createdAt: -1 })
        .exec();

      return {
        data,
        pagination: {
          total: data.length,
          page: 'all',
          limit: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // Handle pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.eventModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    // Validate dates if both are provided
    if (updateEventDto.startDate && updateEventDto.endDate) {
      const startDate = new Date(updateEventDto.startDate);
      const endDate = new Date(updateEventDto.endDate);

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // If only one date is provided, validate against the existing date
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const existingEvent = await this.eventModel.findById(id).exec();
      if (!existingEvent) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : existingEvent.startDate;
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : existingEvent.endDate;

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return updatedEvent;
  }

  async remove(id: string): Promise<void> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    await this.eventModel.findByIdAndDelete(id).exec();
  }
}
