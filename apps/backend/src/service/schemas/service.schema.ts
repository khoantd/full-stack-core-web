import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ServiceStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export type ServiceContentBlock =
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 | 4 }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'image'; url: string; alt?: string };

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ServiceCategory' }], default: undefined })
  categoryIds?: Types.ObjectId[];

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  @Prop({ type: [Object], default: undefined })
  content?: ServiceContentBlock[];

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
