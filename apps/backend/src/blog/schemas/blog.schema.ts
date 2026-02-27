import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'blogs', timestamps: true })
export class Blog extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
