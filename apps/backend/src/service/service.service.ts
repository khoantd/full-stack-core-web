import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';

export interface PaginationResult {
  data: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
  ) {}

  async findAll(query: QueryServiceDto, tenantId: string): Promise<PaginationResult> {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page) || 1;
    const limit = isGetAll ? Number.MAX_SAFE_INTEGER : parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { tenantId };

    if (query.search?.trim()) {
      filter.title = { $regex: query.search.trim(), $options: 'i' };
    }
    if (query.status?.trim()) {
      filter.status = query.status.trim();
    }
    if (query.category?.trim()) {
      filter.category = query.category.trim();
    }

    const total = await this.serviceModel.countDocuments(filter);

    if (isGetAll) {
      const data = await this.serviceModel.find(filter).sort({ createdAt: -1 }).exec();
      return {
        data,
        pagination: { total: data.length, page: 1, limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const data = await this.serviceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findById(id: string, tenantId: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findOne({ _id: id, tenantId }).exec();
      if (!service) throw new NotFoundException(`Service with ID "${id}" not found`);
      return service;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid service ID format: "${id}"`);
      throw new BadRequestException('Failed to get service');
    }
  }

  async create(dto: CreateServiceDto, tenantId: string): Promise<Service> {
    try {
      const newService = new this.serviceModel({ ...dto, tenantId });
      return await newService.save();
    } catch {
      throw new BadRequestException('Failed to create service');
    }
  }

  async update(id: string, dto: UpdateServiceDto, tenantId: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findOne({ _id: id, tenantId });
      if (!service) throw new NotFoundException(`Service with ID "${id}" not found`);
      Object.assign(service, dto);
      return await service.save();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid service ID format: "${id}"`);
      throw new BadRequestException('Failed to update service');
    }
  }

  async delete(id: string, tenantId: string): Promise<{ message: string; id: string }> {
    try {
      const service = await this.serviceModel.findOneAndDelete({ _id: id, tenantId });
      if (!service) throw new NotFoundException(`Service with ID "${id}" not found`);
      return { message: 'Service deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid service ID format: "${id}"`);
      throw new BadRequestException('Failed to delete service');
    }
  }
}
