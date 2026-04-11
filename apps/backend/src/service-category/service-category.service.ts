import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { QueryServiceCategoryDto } from './dto/query-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import {
  ServiceCategory,
  ServiceCategoryDocument,
  type ServiceCategoryTranslatableFields,
} from './schemas/service-category.schema';
import { overlayTranslatedFields, upsertTranslation } from '../common/i18n/translations';

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

  async create(
    dto: CreateServiceCategoryDto,
    tenantId: string,
    locale?: string,
  ): Promise<ServiceCategory> {
    try {
      const payload: Partial<ServiceCategory> = { ...dto, tenantId };
      if (dto.parent) payload.parent = new Types.ObjectId(dto.parent);
      if (locale) {
        payload.translations = upsertTranslation<ServiceCategoryTranslatableFields>(
          payload.translations,
          locale,
          { name: payload.name! },
        );
      }
      const created = new this.serviceCategoryModel(payload);
      return await created.save();
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Category with this slug already exists');
      }
      throw error;
    }
  }

  async findAll(
    queryDto: QueryServiceCategoryDto,
    tenantId: string,
    locale?: string,
  ): Promise<PaginationResult<ServiceCategory>> {
    const { page = '1', limit = '10', search, status } = queryDto;
    const query: Record<string, any> = { tenantId };

    if (search?.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { 'translations.en.name': { $regex: term, $options: 'i' } },
        { 'translations.vi.name': { $regex: term, $options: 'i' } },
      ];
    }
    if (status?.trim()) query.status = status.trim();

    if (page === 'all') {
      const data = await this.serviceCategoryModel
        .find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean()
        .exec();
      return {
        data: data.map((d: any) =>
          overlayTranslatedFields(d, d.translations, locale) as ServiceCategory,
        ),
        pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.serviceCategoryModel
        .find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      this.serviceCategoryModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;
    return {
      data: data.map((d: any) =>
        overlayTranslatedFields(d, d.translations, locale) as ServiceCategory,
      ),
      pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    };
  }

  async findOne(id: string, tenantId: string, locale?: string): Promise<ServiceCategory> {
    const doc = await this.serviceCategoryModel.findOne({ _id: id, tenantId }).lean().exec();
    if (!doc) throw new NotFoundException(`ServiceCategory with ID ${id} not found`);
    return overlayTranslatedFields(doc as any, (doc as any).translations, locale) as ServiceCategory;
  }

  async update(
    id: string,
    dto: UpdateServiceCategoryDto,
    tenantId: string,
    locale?: string,
  ): Promise<ServiceCategory> {
    try {
      const category = await this.serviceCategoryModel.findOne({ _id: id, tenantId }).exec();
      if (!category) throw new NotFoundException(`ServiceCategory with ID ${id} not found`);

      if (dto.name !== undefined) category.name = dto.name;
      if (dto.slug !== undefined) category.slug = dto.slug;
      if (dto.status !== undefined) category.status = dto.status;
      if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
      if (dto.parent === null) category.parent = null;
      else if (typeof dto.parent === 'string' && dto.parent) category.parent = new Types.ObjectId(dto.parent);

      if (locale && dto.name !== undefined) {
        category.translations = upsertTranslation<ServiceCategoryTranslatableFields>(
          category.translations as any,
          locale,
          { name: category.name },
        ) as any;
      }

      await category.save();
      const lean = await this.serviceCategoryModel.findById(category._id).lean().exec();
      return overlayTranslatedFields(lean as any, (lean as any)?.translations, locale) as ServiceCategory;
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
