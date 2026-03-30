import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: false })
  image?: string;

  @Prop({ type: Types.ObjectId, ref: 'CategoryProduct', required: true })
  category: Types.ObjectId;

  @Prop({ required: false })
  sku?: string;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: 5, min: 0 })
  stockThreshold: number;

  @Prop({ default: false })
  isOutOfStock: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
