import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { QueryServiceCategoryDto } from './dto/query-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { ServiceCategory, ServiceCategoryDocument } from './schemas/service-category.schema';

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
export class ServiceCategoryService {
  constructor(
    @InjectModel(ServiceCategory.name)
    private readonly serviceCategoryModel: Model<ServiceCategoryDocument>,
  ) {}

  async create(dto: CreateServiceCategoryDto, tenantId: string): Promise<ServiceCategory> {
    try {
      const payload: Partial<ServiceCategory> = { ...dto, tenantId };
      if (dto.parent) payload.parent = new Types.ObjectId(dto.parent);
      const created = new this.serviceCategoryModel(payload);
      return await created.save();
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Category with this slug already exists');
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryServiceCategoryDto, tenantId: string): Promise<PaginationResult<ServiceCategory>> {
    const { page = '1', limit = '10', search, status } = queryDto;
    const query: Record<string, any> = { tenantId };

    if (search?.trim()) query.name = { $regex: search.trim(), $options: 'i' };
    if (status?.trim()) query.status = status.trim();

    if (page === 'all') {
      const data = await this.serviceCategoryModel
        .find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .exec();
      return {
        data,
        pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.serviceCategoryModel.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limitNum).exec(),
      this.serviceCategoryModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;
    return {
      data,
      pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    };
  }

  async findOne(id: string, tenantId: string): Promise<ServiceCategory> {
    const doc = await this.serviceCategoryModel.findOne({ _id: id, tenantId }).exec();
    if (!doc) throw new NotFoundException(`ServiceCategory with ID ${id} not found`);
    return doc;
  }

  async update(id: string, dto: UpdateServiceCategoryDto, tenantId: string): Promise<ServiceCategory> {
    try {
      const payload: Record<string, any> = { ...dto };
      if (dto.parent === null) payload.parent = null;
      if (typeof dto.parent === 'string' && dto.parent) payload.parent = new Types.ObjectId(dto.parent);

      const updated = await this.serviceCategoryModel.findOneAndUpdate({ _id: id, tenantId }, payload, { new: true }).exec();
      if (!updated) throw new NotFoundException(`ServiceCategory with ID ${id} not found`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error?.code === 11000) throw new BadRequestException('Category with this slug already exists');
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const category = await this.serviceCategoryModel.findOne({ _id: id, tenantId }).exec();
    if (!category) throw new NotFoundException(`ServiceCategory with ID ${id} not found`);

    // Prevent deletion if any service references it
    const ServiceModel = this.serviceCategoryModel.db.model('Service');
    const serviceCount = await ServiceModel.countDocuments({ tenantId, categoryIds: new Types.ObjectId(id) }).exec();
    if (serviceCount > 0) {
      throw new BadRequestException(`Cannot delete category. It has ${serviceCount} service(s) associated with it.`);
    }

    await this.serviceCategoryModel.updateMany({ parent: id }, { parent: null }).exec();
    await this.serviceCategoryModel.findByIdAndDelete(id).exec();
  }
}

