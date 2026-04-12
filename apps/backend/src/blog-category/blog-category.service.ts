import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { QueryBlogCategoryDto } from './dto/query-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import {
  BlogCategory,
  BlogCategoryDocument,
  type BlogCategoryTranslatableFields,
} from './schemas/blog-category.schema';
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
export class BlogCategoryService {
  constructor(
    @InjectModel(BlogCategory.name)
    private readonly blogCategoryModel: Model<BlogCategoryDocument>,
  ) {}

  async create(dto: CreateBlogCategoryDto, tenantId: string, locale?: string): Promise<BlogCategory> {
    try {
      const payload: Partial<BlogCategory> = { ...dto, tenantId };
      if (dto.parent) payload.parent = new Types.ObjectId(dto.parent);
      if (locale) {
        payload.translations = upsertTranslation<BlogCategoryTranslatableFields>(
          payload.translations,
          locale,
          { name: payload.name! },
        );
      }
      const created = new this.blogCategoryModel(payload);
      return await created.save();
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Blog category with this slug already exists');
      }
      throw error;
    }
  }

  async findAll(
    queryDto: QueryBlogCategoryDto,
    tenantId: string,
    locale?: string,
  ): Promise<PaginationResult<BlogCategory>> {
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
      const data = await this.blogCategoryModel
        .find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean()
        .exec();
      return {
        data: data.map((d: any) =>
          overlayTranslatedFields(d, d.translations, locale) as BlogCategory,
        ),
        pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.blogCategoryModel
        .find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      this.blogCategoryModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;
    return {
      data: data.map((d: any) =>
        overlayTranslatedFields(d, d.translations, locale) as BlogCategory,
      ),
      pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    };
  }

  async findOne(id: string, tenantId: string, locale?: string): Promise<BlogCategory> {
    const doc = await this.blogCategoryModel.findOne({ _id: id, tenantId }).lean().exec();
    if (!doc) throw new NotFoundException(`BlogCategory with ID ${id} not found`);
    return overlayTranslatedFields(doc as any, (doc as any).translations, locale) as BlogCategory;
  }

  async update(
    id: string,
    dto: UpdateBlogCategoryDto,
    tenantId: string,
    locale?: string,
  ): Promise<BlogCategory> {
    try {
      const category = await this.blogCategoryModel.findOne({ _id: id, tenantId }).exec();
      if (!category) throw new NotFoundException(`BlogCategory with ID ${id} not found`);

      if (dto.name !== undefined) category.name = dto.name;
      if (dto.slug !== undefined) category.slug = dto.slug;
      if (dto.status !== undefined) category.status = dto.status;
      if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
      if (dto.parent === null) category.parent = null;
      else if (typeof dto.parent === 'string' && dto.parent)
        category.parent = new Types.ObjectId(dto.parent);

      if (locale && dto.name !== undefined) {
        category.translations = upsertTranslation<BlogCategoryTranslatableFields>(
          category.translations as any,
          locale,
          { name: category.name },
        ) as any;
      }

      await category.save();
      const lean = await this.blogCategoryModel.findById(category._id).lean().exec();
      return overlayTranslatedFields(lean as any, (lean as any)?.translations, locale) as BlogCategory;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error?.code === 11000) throw new BadRequestException('Blog category with this slug already exists');
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const category = await this.blogCategoryModel.findOne({ _id: id, tenantId }).exec();
    if (!category) throw new NotFoundException(`BlogCategory with ID ${id} not found`);

    const BlogModel = this.blogCategoryModel.db.model('Blog');
    const blogCount = await BlogModel.countDocuments({ tenantId, categoryId: new Types.ObjectId(id) }).exec();
    if (blogCount > 0) {
      throw new BadRequestException(`Cannot delete category. It has ${blogCount} blog(s) associated with it.`);
    }

    await this.blogCategoryModel.updateMany({ parent: id }, { parent: null }).exec();
    await this.blogCategoryModel.findByIdAndDelete(id).exec();
  }
}
