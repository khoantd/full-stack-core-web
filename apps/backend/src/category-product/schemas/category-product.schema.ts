import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryProductDocument = CategoryProduct & Document;

@Schema({ timestamps: true })
export class CategoryProduct {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'CategoryProduct', default: null })
  parent?: Types.ObjectId | null;
}

export const CategoryProductSchema = SchemaFactory.createForClass(CategoryProduct);
CategoryProductSchema.index({ tenantId: 1, name: 1 }, { unique: true });
