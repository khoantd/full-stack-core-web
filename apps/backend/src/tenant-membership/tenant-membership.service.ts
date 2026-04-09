import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TenantMembership,
  TenantMembershipDocument,
} from './schemas/tenant-membership.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';

@Injectable()
export class TenantMembershipService {
  constructor(
    @InjectModel(TenantMembership.name)
    private membershipModel: Model<TenantMembershipDocument>,
    @InjectModel(Tenant.name)
    private tenantModel: Model<TenantDocument>,
  ) {}

  async ensureMembership(params: {
    userId: Types.ObjectId;
    tenantId: Types.ObjectId;
    roleInTenant?: string;
  }): Promise<void> {
    const { userId, tenantId, roleInTenant } = params;
    await this.membershipModel
      .updateOne(
        { userId, tenantId },
        {
          $setOnInsert: {
            userId,
            tenantId,
            roleInTenant: roleInTenant ?? 'member',
            status: 'active',
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async isMember(params: {
    userId: string;
    tenantId: string;
  }): Promise<boolean> {
    if (!Types.ObjectId.isValid(params.userId) || !Types.ObjectId.isValid(params.tenantId)) {
      return false;
    }
    const count = await this.membershipModel
      .countDocuments({
        userId: new Types.ObjectId(params.userId),
        tenantId: new Types.ObjectId(params.tenantId),
        status: 'active',
      })
      .exec();
    return count > 0;
  }

  async findTenantsForUser(userId: string): Promise<Tenant[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const memberships = await this.membershipModel
      .find({ userId: new Types.ObjectId(userId), status: 'active' })
      .select('tenantId')
      .lean()
      .exec();
    const tenantIds = memberships
      .map((m) => m.tenantId)
      .filter((id): id is Types.ObjectId => Types.ObjectId.isValid(String(id)))
      .map((id) => new Types.ObjectId(String(id)));

    if (tenantIds.length === 0) return [];
    return this.tenantModel
      .find({ _id: { $in: tenantIds } })
      .sort({ createdAt: -1 })
      .exec();
  }
}

