import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ServiceStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

@Schema({ collection: 'services', timestamps: true })
export class Service extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;

  @Prop({ enum: ServiceStatus, default: ServiceStatus.DRAFT })
  status: ServiceStatus;

  @Prop()
  price?: number;

  @Prop()
  duration?: string;

  @Prop()
  category?: string;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
