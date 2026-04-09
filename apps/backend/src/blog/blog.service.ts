import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogStatus } from './schemas/blog.schema';
import { BlogVersion } from './schemas/blog-version.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

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
  ) {}

  async findAll(query: QueryBlogDto, tenantId: string): Promise<PaginationResult> {
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

    const total = await this.blogModel.countDocuments(filter);

    if (isGetAll) {
      const data = await this.blogModel.find(filter).sort({ createdAt: -1 }).exec();
      return {
        data,
        pagination: { total: data.length, page: 1, limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const data = await this.blogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findById(id: string, tenantId: string): Promise<Blog> {
    try {
      const blog = await this.blogModel.findOne({ _id: id, tenantId }).exec();
      if (!blog) throw new NotFoundException(`Blog with ID "${id}" not found`);
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      throw new BadRequestException('Failed to get blog');
    }
  }

  async create(createBlogDto: CreateBlogDto, tenantId: string): Promise<Blog> {
    try {
      const data: any = { ...createBlogDto, tenantId };
      if (data.status === BlogStatus.PUBLISHED && !data.publishedAt) {
        data.publishedAt = new Date();
      }
      const newBlog = new this.blogModel(data);
      const saved = await newBlog.save();
      await this.saveVersion(saved);
      return saved;
    } catch (error) {
      throw new BadRequestException('Failed to create blog');
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, tenantId: string): Promise<Blog> {
    try {
      const blog = await this.blogModel.findOne({ _id: id, tenantId });
      if (!blog) throw new NotFoundException(`Blog with ID "${id}" not found`);

      Object.assign(blog, updateBlogDto);

      if (updateBlogDto.status === BlogStatus.PUBLISHED && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }

      await blog.save();
      await this.saveVersion(blog);
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      throw new BadRequestException('Failed to update blog');
    }
  }

  async delete(id: string, tenantId: string): Promise<{ message: string; id: string }> {
    try {
      const blog = await this.blogModel.findOneAndDelete({ _id: id, tenantId });
      if (!blog) throw new NotFoundException(`Blog with ID "${id}" not found`);
      await this.blogVersionModel.deleteMany({ blogId: id });
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
