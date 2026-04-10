import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { QueryPricingDto } from './dto/query-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Pricing, PricingDocument } from './schemas/pricing.schema';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number | 'all';
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing.name)
    private readonly pricingModel: Model<PricingDocument>,
  ) {}

  async findAll(query: QueryPricingDto, tenantId: string): Promise<PaginationResult<Pricing>> {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page ?? '1', 10) || 1;
    const limit = isGetAll ? Number.MAX_SAFE_INTEGER : parseInt(query.limit ?? '10', 10) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { tenantId };
    if (query.search?.trim()) {
      filter.title = { $regex: query.search.trim(), $options: 'i' };
    }
    if (query.status?.trim()) {
      filter.status = query.status.trim();
    }

    const total = await this.pricingModel.countDocuments(filter).exec();

    if (isGetAll) {
      const data = await this.pricingModel.find(filter).sort({ createdAt: -1 }).exec();
      return {
        data,
        pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const data = await this.pricingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findById(id: string, tenantId: string): Promise<Pricing> {
    try {
      const pricing = await this.pricingModel.findOne({ _id: id, tenantId }).exec();
      if (!pricing) throw new NotFoundException(`Pricing with ID "${id}" not found`);
      return pricing;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error?.name === 'CastError') throw new BadRequestException(`Invalid pricing ID format: "${id}"`);
      throw new BadRequestException('Failed to get pricing');
    }
  }

  async create(dto: CreatePricingDto, tenantId: string): Promise<Pricing> {
    try {
      const payload: Record<string, any> = { ...dto, tenantId };
      // Normalize tier ordering if not provided
      if (Array.isArray(payload.tiers)) {
        payload.tiers = payload.tiers
          .map((t: any, idx: number) => ({ ...t, order: typeof t.order === 'number' ? t.order : idx }))
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      }
      const created = new this.pricingModel(payload);
      return await created.save();
    } catch {
      throw new BadRequestException('Failed to create pricing');
    }
  }

  async update(id: string, dto: UpdatePricingDto, tenantId: string): Promise<Pricing> {
    try {
      const pricing = await this.pricingModel.findOne({ _id: id, tenantId }).exec();
      if (!pricing) throw new NotFoundException(`Pricing with ID "${id}" not found`);

      const payload: Record<string, any> = { ...dto };
      if (payload.tiers) {
        payload.tiers = payload.tiers
          .map((t: any, idx: number) => ({ ...t, order: typeof t.order === 'number' ? t.order : idx }))
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      }

      Object.assign(pricing, payload);
      return await pricing.save();
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error?.name === 'CastError') throw new BadRequestException(`Invalid pricing ID format: "${id}"`);
      throw new BadRequestException('Failed to update pricing');
    }
  }

  async delete(id: string, tenantId: string): Promise<{ message: string; id: string }> {
    try {
      const deleted = await this.pricingModel.findOneAndDelete({ _id: id, tenantId }).exec();
      if (!deleted) throw new NotFoundException(`Pricing with ID "${id}" not found`);
      return { message: 'Pricing deleted successfully', id };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error?.name === 'CastError') throw new BadRequestException(`Invalid pricing ID format: "${id}"`);
      throw new BadRequestException('Failed to delete pricing');
    }
  }
}

