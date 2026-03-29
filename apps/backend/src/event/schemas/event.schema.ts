import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

export enum RegistrationType {
  FREE = 'free',
  PAID = 'paid',
  INVITE_ONLY = 'invite_only',
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ required: false })
  image?: string;

  @Prop({ default: null })
  capacity?: number;

  @Prop({ enum: RegistrationType, default: RegistrationType.PAID })
  registrationType: RegistrationType;

  @Prop({ default: false })
  waitlistEnabled: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
