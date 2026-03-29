import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  action: string; // CREATE | UPDATE | DELETE

  @Prop({ required: true })
  entity: string; // e.g. 'Blog', 'Product', 'User'

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  diff?: Record<string, any>;

  @Prop()
  description?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
