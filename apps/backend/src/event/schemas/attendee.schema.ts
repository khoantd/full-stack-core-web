import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendeeDocument = Attendee & Document;

export enum AttendeeStatus {
  REGISTERED = 'registered',
  WAITLISTED = 'waitlisted',
  ATTENDED = 'attended',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Attendee {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  event: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ enum: AttendeeStatus, default: AttendeeStatus.REGISTERED })
  status: AttendeeStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);
