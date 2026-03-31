import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Tenant } from '../../tenant/schemas/tenant.schema';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ collection: 'api_keys', timestamps: true })
export class ApiKey extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  keyHash: string; // SHA-256 hash of the actual key

  @Prop({ required: true })
  keyPrefix: string; // First 8 chars for display (e.g. "sk_live_")

  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
