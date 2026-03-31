import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentMethod, PaymentStatus, PopulatedPayment } from './schemas/payment.schema';
import { Event, EventDocument } from '../event/schemas/event.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TelegramService } from '../telegram/telegram.service';
import { VietQRService } from '../vietqr/vietqr.service';
import { TenantBankAccountService } from '../tenant/tenant-bank-account.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
    private readonly vietQRService: VietQRService,
    private readonly tenantBankAccountService: TenantBankAccountService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, tenantId?: string): Promise<Payment> {
    if (!Types.ObjectId.isValid(createPaymentDto.event)) {
      throw new BadRequestException('Invalid event ID format');
    }

    const event = await this.eventModel.findById(createPaymentDto.event).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${createPaymentDto.event} not found`);
    }

    const paymentData: any = {
      ...createPaymentDto,
      ...(tenantId ? { tenantId: new Types.ObjectId(tenantId) } : {}),
    };

    if (createPaymentDto.status === PaymentStatus.SUCCESS) {
      paymentData.paidAt = new Date();
    }

    // Auto-generate VietQR when method is VIET_QR
    if (createPaymentDto.paymentMethod === PaymentMethod.VIET_QR && tenantId) {
      const bankAccount = await this.tenantBankAccountService.getDefault(tenantId);
      if (bankAccount) {
        const desc = createPaymentDto.transactionId
          ? `TT ${createPaymentDto.transactionId}`
          : `TT ${createPaymentDto.userEmail}`;
        paymentData.vietQR = this.vietQRService.createVietQR(
          bankAccount.bankCode,
          bankAccount.accountNumber,
          bankAccount.accountName,
          createPaymentDto.amount,
          desc,
        );
      }
    }

    const createdPayment = new this.paymentModel(paymentData);
    return createdPayment.save();
  }

  async findAll(queryDto: QueryPaymentDto, tenantId?: string) {
    const { page = '1', limit = '10', search, eventId, status } = queryDto;
    const query: any = {};

    // Scope to tenant
    if (tenantId) query.tenantId = new Types.ObjectId(tenantId);

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    if (eventId) {
      if (!Types.ObjectId.isValid(eventId)) throw new BadRequestException('Invalid event ID format');
      query.event = new Types.ObjectId(eventId);
    }

    if (status) {
      if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        throw new BadRequestException(`Invalid status. Must be one of: ${Object.values(PaymentStatus).join(', ')}`);
      }
      query.status = status;
    }

    if (page === 'all') {
      const data = await this.paymentModel.find(query).populate('event', 'title price').sort({ createdAt: -1 }).exec();
      return { data, pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.paymentModel.find(query).populate('event', 'title price').sort({ createdAt: -1 }).skip(skip).limit(limitNum).exec(),
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

  async findOne(id: string, tenantId?: string): Promise<PopulatedPayment> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid payment ID format');
    const query: any = { _id: id };
    if (tenantId) query.tenantId = new Types.ObjectId(tenantId);

    const payment = await this.paymentModel.findOne(query).populate('event', 'title price').exec();
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return payment as unknown as PopulatedPayment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, tenantId?: string): Promise<Payment> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid payment ID format');

    if (updatePaymentDto.event) {
      if (!Types.ObjectId.isValid(updatePaymentDto.event)) throw new BadRequestException('Invalid event ID format');
      const event = await this.eventModel.findById(updatePaymentDto.event).exec();
      if (!event) throw new NotFoundException(`Event with ID ${updatePaymentDto.event} not found`);
    }

    const updateData: any = { ...updatePaymentDto };
    if (updatePaymentDto.status === PaymentStatus.SUCCESS) {
      updateData.paidAt = new Date();
    } else if (updatePaymentDto.status) {
      updateData.paidAt = null;
    }

    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = new Types.ObjectId(tenantId);

    const updatedPayment = await this.paymentModel.findOneAndUpdate(filter, updateData, { new: true }).populate('event', 'title price').exec();
    if (!updatedPayment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return updatedPayment;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, tenantId?: string): Promise<Payment> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid payment ID format');

    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = new Types.ObjectId(tenantId);

    const payment = await this.paymentModel.findOne(filter).exec();
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);

    const updateData: any = { status: updateStatusDto.status };
    if (updateStatusDto.status === PaymentStatus.SUCCESS) {
      updateData.paidAt = new Date();
    } else {
      updateData.paidAt = null;
    }

    const updatedPayment = await this.paymentModel.findOneAndUpdate(filter, updateData, { new: true }).populate('event', 'title price').exec();

    if (updateStatusDto.status === PaymentStatus.FAILED) {
      this.telegramService.notifyPaymentFailed(id, (payment as any).amount ?? 0, 'Status updated to FAILED').catch(() => {});
    }

    return updatedPayment!;
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid payment ID format');
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = new Types.ObjectId(tenantId);
    const payment = await this.paymentModel.findOneAndDelete(filter).exec();
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
  }
}
