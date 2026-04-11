import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type Translations } from '../../common/i18n/translations';

export enum TestimonialSectionStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

@Schema({ _id: false })
export class TestimonialItem {
  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  role: string;

  @Prop({ default: 0, min: 0 })
  order: number;
}

export type TestimonialSectionTranslatableFields = {
  eyebrow: string;
  title: string;
  items: TestimonialItem[];
};

export type TestimonialSectionDocument = TestimonialSection & Document;

@Schema({ collection: 'testimonial_sections', timestamps: true })
export class TestimonialSection extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  eyebrow: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, lowercase: true })
  slug?: string;

  @Prop({ enum: TestimonialSectionStatus, default: TestimonialSectionStatus.DRAFT })
  status: TestimonialSectionStatus;

  @Prop({ type: [TestimonialItem], default: [] })
  items: TestimonialItem[];

  @Prop({ type: Object, default: undefined })
  translations?: Translations<TestimonialSectionTranslatableFields>;

  createdAt: Date;
  updatedAt: Date;
}

export const TestimonialSectionSchema = SchemaFactory.createForClass(TestimonialSection);
