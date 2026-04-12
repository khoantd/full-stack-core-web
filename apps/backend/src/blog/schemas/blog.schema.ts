import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type Translations } from '../../common/i18n/translations';
import { BlogCategory } from '../../blog-category/schemas/blog-category.schema';

export enum BlogStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export type BlogTranslatableFields = {
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
};

@Schema({ collection: 'blogs', timestamps: true })
export class Blog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;

  @Prop({ enum: BlogStatus, default: BlogStatus.DRAFT })
  status: BlogStatus;

  @Prop()
  author?: string;

  @Prop()
  publishedAt?: Date;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  @Prop({ type: Types.ObjectId, ref: BlogCategory.name, default: null })
  categoryId?: Types.ObjectId | null;

  @Prop({ type: Object, default: undefined })
  translations?: Translations<BlogTranslatableFields>;

  createdAt: Date;
  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
