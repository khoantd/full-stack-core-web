import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument, FeatureKey, LandingConfig } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';

type UpdateTenantPayload = Partial<CreateTenantDto> & { enabledFeatures?: FeatureKey[] };

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const slug = dto.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const existing = await this.tenantModel.findOne({ slug });
    if (existing) throw new ConflictException(`Slug "${slug}" is already taken`);
    return this.tenantModel.create({ ...dto, slug });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      return await this.tenantModel.findById(id).exec();
    } catch {
      return null;
    }
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

  async updateLandingConfig(id: string, config: LandingConfig): Promise<Tenant> {
    const tenant = await this.tenantModel.findByIdAndUpdate(
      id,
      { $set: { landingConfig: config } },
      { new: true },
    ).exec();
    if (!tenant) throw new NotFoundException(`Tenant not found`);
    return tenant;
  }
}
