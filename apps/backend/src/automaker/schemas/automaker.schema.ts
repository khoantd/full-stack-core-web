import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AutomakerDocument = AutomakerEntity & Document;

@Schema({ collection: 'automakers', timestamps: true })
export class AutomakerEntity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  logo?: string;

  @Prop({ type: [Number], default: [] })
  supportedModelYears: number[];

  createdAt: Date;
  updatedAt: Date;
}

export const AutomakerEntitySchema = SchemaFactory.createForClass(AutomakerEntity);
