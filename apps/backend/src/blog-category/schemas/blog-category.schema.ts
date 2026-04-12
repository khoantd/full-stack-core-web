import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type Translations } from '../../common/i18n/translations';

export enum BlogCategoryStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export type BlogCategoryDocument = BlogCategory & Document;

export type BlogCategoryTranslatableFields = {
  name: string;
};

@Schema({ collection: 'blogCategories', timestamps: true })
export class BlogCategory {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ enum: BlogCategoryStatus, default: BlogCategoryStatus.PUBLISHED })
  status: BlogCategoryStatus;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'BlogCategory', default: null })
  parent?: Types.ObjectId | null;

  @Prop({ type: Object, default: undefined })
  translations?: Translations<BlogCategoryTranslatableFields>;

  createdAt: Date;
  updatedAt: Date;
}

export const BlogCategorySchema = SchemaFactory.createForClass(BlogCategory);
BlogCategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
