import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TenantBankAccount, TenantBankAccountDocument } from './schemas/tenant-bank-account.schema';
import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { BankCode } from '../vietqr/vietqr.types';

export class UpsertBankAccountDto {
  @IsEnum(BankCode)
  bankCode: BankCode;

  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

@Injectable()
export class TenantBankAccountService {
  constructor(
    @InjectModel(TenantBankAccount.name)
    private model: Model<TenantBankAccountDocument>,
  ) {}

  async findByTenant(tenantId: string): Promise<TenantBankAccount[]> {
    return this.model.find({ tenantId: new Types.ObjectId(tenantId) }).sort({ isDefault: -1 }).exec();
  }

  async getDefault(tenantId: string): Promise<TenantBankAccount | null> {
    return this.model.findOne({ tenantId: new Types.ObjectId(tenantId), isDefault: true }).exec();
  }

  async upsert(tenantId: string, dto: UpsertBankAccountDto): Promise<TenantBankAccount> {
    // If setting as default, unset others first
    if (dto.isDefault) {
      await this.model.updateMany({ tenantId: new Types.ObjectId(tenantId) }, { isDefault: false });
    }
    return this.model.findOneAndUpdate(
      { tenantId: new Types.ObjectId(tenantId), accountNumber: dto.accountNumber },
      { ...dto, tenantId: new Types.ObjectId(tenantId) },
      { upsert: true, new: true },
    ).exec();
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.model.findOneAndDelete({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    }).exec();
    if (!result) throw new NotFoundException('Bank account not found');
  }
}
