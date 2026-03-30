import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from './role.schema';
import { Tenant } from '../../tenant/schemas/tenant.schema';


@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  password?: string; // Chỉ cần khi đăng ký qua form

  @Prop({ unique: true, sparse: true })
  uid?: string; // UID từ Firebase

  @Prop({ type: Types.ObjectId, ref: Role.name })
  role: Role;

  @Prop({ type: Types.ObjectId, ref: Tenant.name, index: true })
  tenantId?: Types.ObjectId;

  @Prop({ default: false })
  securityConfirmed: boolean;

  @Prop()
  image?: string;

  @Prop()
  country?: string;

  @Prop()
  status?: string;

  @Prop()
  plan_name?: string;

  @Prop({ default: 0 })
  failedLoginAttempts?: number;

  @Prop()
  lockUntil?: Date;

  @Prop()
  refreshToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
