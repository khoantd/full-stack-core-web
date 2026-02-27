import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from './schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

interface PaginationResult {
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
  ) {}

  /**
   * Get all blogs with pagination and search
   * Query params:
   *   - page=1&limit=10&search=title (with pagination)
   *   - page=all&search=title (get all, no pagination)
   */
  async findAll(query: QueryBlogDto): Promise<PaginationResult> {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page) || 1;
    const limit = isGetAll ? Number.MAX_SAFE_INTEGER : parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, any> = {};

    // Search by title using MongoDB regex (case insensitive)
    if (query.search && query.search.trim()) {
      filter.title = { $regex: query.search.trim(), $options: 'i' };
    }

    // Get total count
    const total = await this.blogModel.countDocuments(filter);

    // If page=all, get all without pagination
    if (isGetAll) {
      const data = await this.blogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .exec();

      return {
        data,
        pagination: {
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // With pagination
    const data = await this.blogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get blog by ID
   */
  async findById(id: string): Promise<Blog> {
    try {
      const blog = await this.blogModel.findById(id).exec();

      if (!blog) {
        throw new NotFoundException(`Blog with ID "${id}" not found`);
      }

      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle invalid ObjectId format
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to get blog');
    }
  }

  /**
   * Create new blog
   */
  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    try {
      const newBlog = new this.blogModel({
        title: createBlogDto.title,
        description: createBlogDto.description,
        image: createBlogDto.image,
      });

      const savedBlog = await newBlog.save();
      return savedBlog;
    } catch (error) {
      throw new BadRequestException('Failed to create blog');
    }
  }

  /**
   * Update blog by ID
   */
  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    try {
      const blog = await this.blogModel.findById(id);

      if (!blog) {
        throw new NotFoundException(`Blog with ID "${id}" not found`);
      }

      // Update fields if provided
      if (updateBlogDto.title !== undefined) {
        blog.title = updateBlogDto.title;
      }
      if (updateBlogDto.description !== undefined) {
        blog.description = updateBlogDto.description;
      }
      if (updateBlogDto.image !== undefined) {
        blog.image = updateBlogDto.image;
      }

      await blog.save();

      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle invalid ObjectId format
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to update blog');
    }
  }

  /**
   * Delete blog by ID
   */
  async delete(id: string): Promise<{ message: string; id: string }> {
    try {
      const blog = await this.blogModel.findById(id);

      if (!blog) {
        throw new NotFoundException(`Blog with ID "${id}" not found`);
      }

      await this.blogModel.findByIdAndDelete(id);

      return { message: 'Blog deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle invalid ObjectId format
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid blog ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to delete blog');
    }
  }
}
