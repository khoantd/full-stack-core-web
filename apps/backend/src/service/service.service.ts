import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, type ServiceTranslatableFields } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { overlayTranslatedFields, upsertTranslation } from '../common/i18n/translations';

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

  private static readonly DEFAULT_LOCALE = 'en';
  private static readonly TRANSLATABLE_KEYS = [
    'title',
    'description',
    'seoTitle',
    'seoDescription',
    'duration',
    'category',
    'content',
  ] as const;

  private splitBaseAndTranslationPayload<TDto extends Record<string, any>>(
    dto: TDto,
    locale: string | undefined,
  ): { basePatch: Partial<TDto>; translationPatch: Partial<ServiceTranslatableFields> } {
    const isDefaultLocale = !locale || locale === ServiceService.DEFAULT_LOCALE;

    const basePatch: Record<string, any> = { ...dto };
    const translationPatch: Partial<ServiceTranslatableFields> = {};

    for (const key of ServiceService.TRANSLATABLE_KEYS) {
      if (dto[key] !== undefined) {
        translationPatch[key] = dto[key];
      }

      if (!isDefaultLocale) {
        delete basePatch[key];
      }
    }

    return { basePatch: basePatch as Partial<TDto>, translationPatch };
  }

  async findAll(query: QueryServiceDto, tenantId: string, locale?: string): Promise<PaginationResult> {
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
    if (query.categoryIds?.trim()) {
      const ids = query.categoryIds
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        filter.categoryIds = { $in: ids.map((id) => new Types.ObjectId(id)) };
      }
    }

    const total = await this.serviceModel.countDocuments(filter);

    if (isGetAll) {
      const data = await this.serviceModel.find(filter).sort({ createdAt: -1 }).lean().exec();
      return {
        data: data.map((s: any) => overlayTranslatedFields(s, s.translations, locale)),
        pagination: { total: data.length, page: 1, limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const data = await this.serviceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec();
    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((s: any) => overlayTranslatedFields(s, s.translations, locale)),
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findById(id: string, tenantId: string, locale?: string): Promise<any> {
    try {
      const service = await this.serviceModel.findOne({ _id: id, tenantId }).lean().exec();
      if (!service) throw new NotFoundException(`Service with ID "${id}" not found`);
      return overlayTranslatedFields(service as any, (service as any).translations, locale);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid service ID format: "${id}"`);
      throw new BadRequestException('Failed to get service');
    }
  }

  async create(dto: CreateServiceDto, tenantId: string, locale?: string): Promise<Service> {
    try {
      const { basePatch, translationPatch } = this.splitBaseAndTranslationPayload(dto as any, locale);
      const payload: Record<string, any> = { ...basePatch, tenantId };

      if (dto.categoryIds?.length) {
        payload.categoryIds = dto.categoryIds.map((id) => new Types.ObjectId(id));
      }

      if (locale && Object.keys(translationPatch).length > 0) {
        payload.translations = upsertTranslation<ServiceTranslatableFields>(
          payload.translations,
          locale,
          translationPatch,
        );
      }

      const newService = new this.serviceModel(payload as any);
      return await newService.save();
    } catch {
      throw new BadRequestException('Failed to create service');
    }
  }

  async update(id: string, dto: UpdateServiceDto, tenantId: string, locale?: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findOne({ _id: id, tenantId });
      if (!service) throw new NotFoundException(`Service with ID "${id}" not found`);
      const { basePatch, translationPatch } = this.splitBaseAndTranslationPayload(dto as any, locale);
      const payload: Record<string, any> = { ...basePatch };
      if (dto.categoryIds) {
        payload.categoryIds = dto.categoryIds.map((cid) => new Types.ObjectId(cid));
      }
      Object.assign(service, payload);

      if (locale && Object.keys(translationPatch).length > 0) {
        const isDefaultLocale = locale === ServiceService.DEFAULT_LOCALE;
        const patch: Partial<ServiceTranslatableFields> = {};
        for (const key of ServiceService.TRANSLATABLE_KEYS) {
          if (translationPatch[key] === undefined) continue;
          patch[key] = isDefaultLocale ? (service as any)[key] : translationPatch[key];
        }
        service.translations = upsertTranslation<ServiceTranslatableFields>(
          service.translations as any,
          locale,
          patch,
        ) as any;
      }
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
