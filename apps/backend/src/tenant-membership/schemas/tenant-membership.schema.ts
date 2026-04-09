import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Tenant } from '../../tenant/schemas/tenant.schema';

export type TenantMembershipDocument = TenantMembership & Document;

@Schema({ collection: 'tenant_memberships', timestamps: true })
export class TenantMembership {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ default: 'member' })
  roleInTenant?: string;

  @Prop({ default: 'active' })
  status?: string;
}

export const TenantMembershipSchema = SchemaFactory.createForClass(TenantMembership);
TenantMembershipSchema.index({ userId: 1, tenantId: 1 }, { unique: true });

