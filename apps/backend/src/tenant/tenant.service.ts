import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Tenant, TenantDocument, FeatureKey } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantMembershipService } from '../tenant-membership/tenant-membership.service';

type UpdateTenantPayload = Partial<CreateTenantDto> & { enabledFeatures?: FeatureKey[] };

export type ResolvedTenantContext = { tenant: TenantDocument; effectiveTenantId: string };

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly tenantMembershipService: TenantMembershipService,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const slug = dto.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const existing = await this.tenantModel.findOne({ slug });
    if (existing) throw new ConflictException(`Slug "${slug}" is already taken`);
    return this.tenantModel.create({ ...dto, slug });
  }

  async createForUserEmail(dto: CreateTenantDto, email: string | undefined): Promise<Tenant> {
    const tenant = await this.create(dto);
    if (!email) return tenant;

    const user = await this.userModel.findOne({ email }).select('_id').exec();
    if (user?._id) {
      await this.tenantMembershipService.ensureMembership({
        userId: user._id as unknown as Types.ObjectId,
        tenantId: (tenant as any)._id as Types.ObjectId,
        roleInTenant: 'admin',
      });
    }

    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().sort({ createdAt: -1 }).exec();
  }

  async findAllForUserEmail(email: string | undefined): Promise<Tenant[]> {
    if (!email) return [];
    const user = await this.userModel.findOne({ email }).select('_id').lean().exec();
    if (!user?._id) return [];
    return this.tenantMembershipService.findTenantsForUser(String((user as any)._id));
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      return await this.tenantModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  /**
   * Resolves the tenant for an authenticated request: JWT tenantId first, then the user's
   * stored tenantId, then assigns the oldest tenant (same repair strategy as login) when both are stale.
   */
  async resolveActiveTenantForRequest(
    jwtTenantId: string | undefined,
    userEmail: string | undefined,
  ): Promise<ResolvedTenantContext | null> {
    const tryJwt =
      jwtTenantId &&
      jwtTenantId !== 'undefined' &&
      Types.ObjectId.isValid(jwtTenantId);
    if (tryJwt) {
      const fromJwt = await this.tenantModel.findById(jwtTenantId).exec();
      if (fromJwt) {
        return { tenant: fromJwt, effectiveTenantId: (fromJwt._id as Types.ObjectId).toString() };
      }
    }

    if (!userEmail) return null;

    const userDoc = await this.userModel.findOne({ email: userEmail }).exec();
    if (!userDoc) return null;

    const dbTid = userDoc.tenantId ? (userDoc.tenantId as Types.ObjectId).toString() : null;
    if (dbTid && Types.ObjectId.isValid(dbTid)) {
      const fromUser = await this.tenantModel.findById(dbTid).exec();
      if (fromUser) {
        return { tenant: fromUser, effectiveTenantId: dbTid };
      }
    }

    const defaultTenant = await this.tenantModel.findOne().sort({ createdAt: 1 }).exec();
    if (!defaultTenant) return null;

    userDoc.tenantId = defaultTenant._id as Types.ObjectId;
    await userDoc.save();
    return {
      tenant: defaultTenant,
      effectiveTenantId: (defaultTenant._id as Types.ObjectId).toString(),
    };
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ slug }).exec();
  }

  async update(id: string, dto: UpdateTenantPayload): Promise<Tenant> {
    if (dto.slug) {
      const slug = dto.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const existing = await this.tenantModel.findOne({ slug, _id: { $ne: id } });
      if (existing) throw new ConflictException(`Slug "${slug}" is already taken`);
      dto = { ...dto, slug };
    }
    const tenant = await this.tenantModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!tenant) throw new NotFoundException(`Tenant not found`);
    return tenant;
  }

  async delete(id: string): Promise<{ message: string }> {
    const tenant = await this.tenantModel.findByIdAndDelete(id).exec();
    if (!tenant) throw new NotFoundException(`Tenant not found`);
    return { message: 'Tenant deleted successfully' };
  }
}
