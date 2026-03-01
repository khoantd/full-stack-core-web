import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus, PopulatedPayment } from './schemas/payment.schema';
import { Event, EventDocument } from '../event/schemas/event.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Validate event exists
    if (!Types.ObjectId.isValid(createPaymentDto.event)) {
      throw new BadRequestException('Invalid event ID format');
    }

    const event = await this.eventModel.findById(createPaymentDto.event).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${createPaymentDto.event} not found`);
    }

    // Handle paidAt based on status
    const paymentData: any = { ...createPaymentDto };
    if (createPaymentDto.status === PaymentStatus.SUCCESS) {
      paymentData.paidAt = new Date();
    }

    const createdPayment = new this.paymentModel(paymentData);
    return await createdPayment.save();
  }

  async findAll(queryDto: QueryPaymentDto) {
    const { page = '1', limit = '10', search, eventId, status } = queryDto;
    const query: any = {};

    // Search by userName or userEmail
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by event
    if (eventId) {
      if (!Types.ObjectId.isValid(eventId)) {
        throw new BadRequestException('Invalid event ID format');
      }
      query.event = new Types.ObjectId(eventId);
    }

    // Filter by status
    if (status) {
      if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        throw new BadRequestException(`Invalid status. Must be one of: ${Object.values(PaymentStatus).join(', ')}`);
      }
      query.status = status;
    }

    // Handle page=all
    if (page === 'all') {
      const data = await this.paymentModel
        .find(query)
        .populate('event', 'title price')
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
      this.paymentModel
        .find(query)
        .populate('event', 'title price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.paymentModel.countDocuments(query).exec(),
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

  async findOne(id: string): Promise<PopulatedPayment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID format');
    }

    const payment = await this.paymentModel
      .findById(id)
      .populate('event', 'title price')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment as unknown as PopulatedPayment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID format');
    }

    // Validate event exists if updating event
    if (updatePaymentDto.event) {
      if (!Types.ObjectId.isValid(updatePaymentDto.event)) {
        throw new BadRequestException('Invalid event ID format');
      }

      const event = await this.eventModel.findById(updatePaymentDto.event).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${updatePaymentDto.event} not found`);
      }
    }

    // Handle paidAt based on status
    const updateData: any = { ...updatePaymentDto };
    if (updatePaymentDto.status === PaymentStatus.SUCCESS) {
      updateData.paidAt = new Date();
    } else if (updatePaymentDto.status) {
      // status is PENDING or FAILED → clear paidAt
      updateData.paidAt = null;
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('event', 'title price')
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<Payment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID format');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Handle paidAt based on status
    const updateData: any = { status: updateStatusDto.status };
    if (updateStatusDto.status === PaymentStatus.SUCCESS) {
      updateData.paidAt = new Date();
    } else {
      updateData.paidAt = null;
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('event', 'title price')
      .exec();

    return updatedPayment!;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID format');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    await this.paymentModel.findByIdAndDelete(id).exec();
  }
}
