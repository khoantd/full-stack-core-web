import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type AuditLogDiff = Record<
  string,
  {
    from?: unknown;
    to?: unknown;
  }
>;

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  action: AuditLogAction;

  @Prop({ required: true })
  entity: string; // e.g. 'Blog', 'Product', 'User'

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  diff?: AuditLogDiff;

  @Prop()
  description?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, entity: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
