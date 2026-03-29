import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogVersionDocument = BlogVersion & Document;

@Schema({ collection: 'blog_versions', timestamps: true })
export class BlogVersion {
  @Prop({ type: Types.ObjectId, ref: 'Blog', required: true, index: true })
  blogId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;

  @Prop()
  status?: string;

  @Prop()
  author?: string;

  @Prop({ required: true })
  versionNumber: number;

  createdAt: Date;
}

export const BlogVersionSchema = SchemaFactory.createForClass(BlogVersion);
