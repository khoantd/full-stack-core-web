import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export const ALL_FEATURES = [
  'categories',
  'products',
  'automakers',
  'events',
  'services',
  'serviceCategories',
  'blogs',
  'payments',
  'pricings',
] as const;

export type FeatureKey = typeof ALL_FEATURES[number];

export class LandingConfig {
  siteName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  theme?: string;
  heroEnabled?: boolean;
  categoriesEnabled?: boolean;
  statsEnabled?: boolean;
  aboutEnabled?: boolean;
  productsEnabled?: boolean;
  testimonialsEnabled?: boolean;
  blogsEnabled?: boolean;
  contactEnabled?: boolean;
}

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

  @Prop({ default: 'en' })
  defaultLocale: string;

  @Prop({ type: [String], default: ['en'] })
  supportedLocales: string[];

  @Prop({ type: Object, default: {} })
  landingConfig: LandingConfig;

  createdAt: Date;
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
