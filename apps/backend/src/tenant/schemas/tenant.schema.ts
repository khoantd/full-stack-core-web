import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export const ALL_FEATURES = [
  'categories',
  'products',
  'automakers',
  'events',
  'services',
  'blogs',
  'payments',
] as const;

export type FeatureKey = typeof ALL_FEATURES[number];

@Schema({ collection: 'tenants', timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop()
  logo?: string;

  @Prop()
  domain?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  plan?: string;

  @Prop({ type: [String], default: [...ALL_FEATURES] })
  enabledFeatures: FeatureKey[];

  createdAt: Date;
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
