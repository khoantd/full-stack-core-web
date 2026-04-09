import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BankCode } from '../../vietqr/vietqr.types';

export type TenantBankAccountDocument = TenantBankAccount & Document;

@Schema({ collection: 'tenant_bank_accounts', timestamps: true })
export class TenantBankAccount extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: Object.values(BankCode) })
  bankCode: BankCode;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ default: true })
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const TenantBankAccountSchema = SchemaFactory.createForClass(TenantBankAccount);
