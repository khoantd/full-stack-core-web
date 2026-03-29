import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'system_settings', timestamps: true })
export class SystemSettings extends Document {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: Object })
  value: any;

  @Prop()
  description?: string;

  @Prop({ default: 'general' })
  group: string; // general | security | integrations | notifications
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);
