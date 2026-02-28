import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryProductDocument = CategoryProduct & Document;

@Schema({ timestamps: true })
export class CategoryProduct {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description?: string;
}

export const CategoryProductSchema = SchemaFactory.createForClass(CategoryProduct);
