import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type Translations } from '../../common/i18n/translations';

export enum ServiceCategoryStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export type ServiceCategoryDocument = ServiceCategory & Document;

/** Localized display name; slug/status/sortOrder/parent stay on the root document only. */
export type ServiceCategoryTranslatableFields = {
  name: string;
};

@Schema({ collection: 'serviceCategories', timestamps: true })
export class ServiceCategory {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ enum: ServiceCategoryStatus, default: ServiceCategoryStatus.PUBLISHED })
  status: ServiceCategoryStatus;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'ServiceCategory', default: null })
  parent?: Types.ObjectId | null;

  @Prop({ type: Object, default: undefined })
  translations?: Translations<ServiceCategoryTranslatableFields>;

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceCategorySchema = SchemaFactory.createForClass(ServiceCategory);
ServiceCategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });

