import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Event } from '../../event/schemas/event.schema';

export type PaymentDocument = Payment & Document;

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ required: false })
  transactionId?: string;

  @Prop({ required: false })
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Type for populated payment
export interface PopulatedPayment extends Omit<Payment, 'event'> {
  _id: Types.ObjectId;
  event: {
    _id: Types.ObjectId;
    title: string;
    price: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
