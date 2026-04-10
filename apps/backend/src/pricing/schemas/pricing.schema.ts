import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PricingStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export enum PricingCurrency {
  VND = 'VND',
  USD = 'USD',
}

@Schema({ _id: false })
export class PricingTier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: PricingCurrency })
  currency: PricingCurrency;

  /**
   * Minor units:
   * - USD: cents
   * - VND: dong
   */
  @Prop({ required: true, min: 0 })
  unitAmount: number;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: undefined })
  features?: string[];

  @Prop({ default: 0, min: 0 })
  order: number;
}

export type PricingDocument = Pricing & Document;

@Schema({ collection: 'pricings', timestamps: true })
export class Pricing extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, lowercase: true })
  slug?: string;

  @Prop({ enum: PricingStatus, default: PricingStatus.DRAFT })
  status: PricingStatus;

  @Prop({ type: [PricingTier], default: [] })
  tiers: PricingTier[];

  createdAt: Date;
  updatedAt: Date;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);
