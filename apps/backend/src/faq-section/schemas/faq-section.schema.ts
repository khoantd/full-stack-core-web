import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type Translations } from '../../common/i18n/translations';

export enum FaqSectionStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

@Schema({ _id: false })
export class FaqItem {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;

  @Prop({ default: 0, min: 0 })
  order: number;
}

export type FaqSectionTranslatableFields = {
  eyebrow: string;
  title: string;
  items: FaqItem[];
};

export type FaqSectionDocument = FaqSection & Document;

@Schema({ collection: 'faq_sections', timestamps: true })
export class FaqSection extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  eyebrow: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, lowercase: true })
  slug?: string;

  @Prop({ enum: FaqSectionStatus, default: FaqSectionStatus.DRAFT })
  status: FaqSectionStatus;

  @Prop({ type: [FaqItem], default: [] })
  items: FaqItem[];

  @Prop({ type: Object, default: undefined })
  translations?: Translations<FaqSectionTranslatableFields>;

  createdAt: Date;
  updatedAt: Date;
}

export const FaqSectionSchema = SchemaFactory.createForClass(FaqSection);
