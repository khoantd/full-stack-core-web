import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum AppointmentSource {
  DASHBOARD = 'dashboard',
  PUBLIC = 'public',
  INTEGRATION = 'integration',
}

@Schema({ _id: false })
export class AppointmentCustomer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;
}

const AppointmentCustomerSchema = SchemaFactory.createForClass(AppointmentCustomer);

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Prop({ type: AppointmentCustomerSchema, required: true })
  customer: AppointmentCustomer;

  @Prop()
  notes?: string;

  @Prop({ enum: AppointmentSource, default: AppointmentSource.DASHBOARD })
  source: AppointmentSource;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId?: Types.ObjectId;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ tenantId: 1, startAt: 1 });
