import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogStatus, type BlogTranslatableFields } from './schemas/blog.schema';
import { BlogVersion } from './schemas/blog-version.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { overlayTranslatedFields, upsertTranslation } from '../common/i18n/translations';
import { AuditLogService } from '../audit-log/audit-log.service';
import { buildCreateDiff, buildDeleteDiff, buildUpdateDiff } from '../audit-log/audit-log.diff';
import { ActorContext } from '../audit-log/audit-log.types';

export interface PaginationResult {
  data: Blog[];
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
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
    @InjectModel(BlogVersion.name) private readonly blogVersionModel: Model<BlogVersion>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: QueryBlogDto, tenantId: string, locale?: string): Promise<PaginationResult> {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page) || 1;
    const limit = isGetAll ? Number.MAX_SAFE_INTEGER : parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { tenantId };

    if (query.search && query.search.trim()) {
      filter.title = { $regex: query.search.trim(), $options: 'i' };
    }

    if (query.status && query.status.trim()) {
      filter.status = query.status.trim();
    }

    if (query.categoryId && query.categoryId.trim()) {
      filter.categoryId = new Types.ObjectId(query.categoryId.trim());
    }

    const total = await this.blogModel.countDocuments(filter);

    if (isGetAll) {
      const data = await this.blogModel.find(filter).sort({ createdAt: -1 }).lean().exec();
      return {
        data: data.map((b: any) => overlayTranslatedFields(b, b.translations, locale)),
        pagination: { total: data.length, page: 1, limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const data = await this.blogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec();
    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((b: any) => overlayTranslatedFields(b, b.translations, locale)),
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findById(id: string, tenantId: string, locale?: string): Promise<any> {
    try {
      const blog = await this.blogModel.findOne({ _id: id, tenantId }).lean().exec();
      if (!blog) throw new NotFoundException(`Blog with ID "${id}" not found`);
      return overlayTranslatedFields(blog as any, (blog as any).translations, locale);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      throw new BadRequestException('Failed to get blog');
    }
  }

  async create(createBlogDto: CreateBlogDto, tenantId: string, actor: ActorContext, locale?: string): Promise<Blog> {
    try {
      const data: any = { ...createBlogDto, tenantId };
      if (data.categoryId) data.categoryId = new Types.ObjectId(data.categoryId);
      if (data.status === BlogStatus.PUBLISHED && !data.publishedAt) {
        data.publishedAt = new Date();
      }
      if (locale) {
        const patch: Partial<BlogTranslatableFields> = {
          title: data.title,
          description: data.description,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          author: data.author,
        };
        data.translations = upsertTranslation<BlogTranslatableFields>(data.translations, locale, patch);
      }
      const newBlog = new this.blogModel(data);
      const saved = await newBlog.save();
      await this.saveVersion(saved);

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'CREATE',
        entity: 'Blog',
        entityId: String((saved as any)._id),
        diff: buildCreateDiff(createBlogDto as unknown as Record<string, unknown>),
        description: `Created blog ${(saved as any)._id}`,
      });

      return saved;
    } catch (error) {
      throw new BadRequestException('Failed to create blog');
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, tenantId: string, actor: ActorContext, locale?: string): Promise<Blog> {
    try {
      const blog = await this.blogModel.findOne({ _id: id, tenantId });
      if (!blog) throw new NotFoundException(`Blog with ID "${id}" not found`);

      const before = (blog as any).toObject() as Record<string, unknown>;
      const hasImageUpdate = Object.prototype.hasOwnProperty.call(updateBlogDto, 'image');
      const { image, ...rest } = updateBlogDto as UpdateBlogDto & { image?: string | null };
      Object.assign(blog, rest);

      if (hasImageUpdate) {
        if (image == null || image === '') {
          await this.blogModel.updateOne({ _id: id, tenantId }, { $unset: { image: 1 } });
          delete (blog as { image?: string }).image;
        } else {
          blog.image = image;
        }
      }

      if (Object.prototype.hasOwnProperty.call(updateBlogDto, 'categoryId')) {
        const cid = (updateBlogDto as any).categoryId;
        if (cid == null) {
          (blog as any).categoryId = null;
        } else {
          (blog as any).categoryId = new Types.ObjectId(cid);
        }
      }

      if (updateBlogDto.status === BlogStatus.PUBLISHED && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }

      if (locale) {
        const patch: Partial<BlogTranslatableFields> = {};
        if (updateBlogDto.title !== undefined) patch.title = blog.title;
        if (updateBlogDto.description !== undefined) patch.description = blog.description;
        if (updateBlogDto.seoTitle !== undefined) patch.seoTitle = blog.seoTitle;
        if (updateBlogDto.seoDescription !== undefined) patch.seoDescription = blog.seoDescription;
        if (updateBlogDto.author !== undefined) patch.author = blog.author;

        blog.translations = upsertTranslation<BlogTranslatableFields>(
          blog.translations as any,
          locale,
          patch,
        ) as any;
      }

      await blog.save();
      await this.saveVersion(blog);

      const after = (blog as any).toObject() as Record<string, unknown>;
      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'UPDATE',
        entity: 'Blog',
        entityId: String(id),
        diff: buildUpdateDiff({
          before,
          after,
          patch: updateBlogDto as unknown as Record<string, unknown>,
        }),
        description: `Updated blog ${id}`,
      });

      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      throw new BadRequestException('Failed to update blog');
    }
  }

  async delete(id: string, tenantId: string, actor: ActorContext): Promise<{ message: string; id: string }> {
    try {
      const blog = await this.blogModel.findOneAndDelete({ _id: id, tenantId }).lean();
      if (!blog) throw new NotFoundException(`Blog with ID "${id}" not found`);
      await this.blogVersionModel.deleteMany({ blogId: id });

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'DELETE',
        entity: 'Blog',
        entityId: String(id),
        diff: buildDeleteDiff(blog as unknown as Record<string, unknown>, {
          allowlist: ['_id', 'title', 'status', 'categoryId', 'author'],
        }),
        description: `Deleted blog ${id}`,
      });

      return { message: 'Blog deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      throw new BadRequestException('Failed to delete blog');
    }
  }

  async getVersions(blogId: string, tenantId: string): Promise<BlogVersion[]> {
    const blog = await this.blogModel.findOne({ _id: blogId, tenantId }).exec();
    if (!blog) throw new NotFoundException(`Blog with ID "${blogId}" not found`);
    return this.blogVersionModel.find({ blogId }).sort({ versionNumber: -1 }).exec();
  }

  async restoreVersion(blogId: string, versionId: string, tenantId: string): Promise<Blog> {
    const blog = await this.blogModel.findOne({ _id: blogId, tenantId });
    if (!blog) throw new NotFoundException('Blog not found');

    const version = await this.blogVersionModel.findById(versionId).exec();
    if (!version) throw new NotFoundException('Version not found');
    if (String((version as any).blogId) !== String(blogId)) {
      throw new NotFoundException('Version not found');
    }

    blog.title = version.title;
    blog.description = version.description;
    if (version.image !== undefined) blog.image = version.image;
    if (version.status) blog.status = version.status as BlogStatus;
    if (version.author !== undefined) blog.author = version.author;

    await blog.save();
    await this.saveVersion(blog);
    return blog;
  }

  private async saveVersion(blog: any): Promise<void> {
    const count = await this.blogVersionModel.countDocuments({ blogId: blog._id });
    await this.blogVersionModel.create({
      blogId: blog._id,
      title: blog.title,
      description: blog.description,
      image: blog.image,
      status: blog.status,
      author: blog.author,
      versionNumber: count + 1,
    });
  }
}
