import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { CategoryProduct, CategoryProductDocument } from '../category-product/schemas/category-product.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Blog, BlogStatus } from '../blog/schemas/blog.schema';

export interface PublicBlogsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class LandingService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(CategoryProduct.name) private categoryModel: Model<CategoryProductDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) {}

  /**
   * Resolves tenant for public landing: request slug (X-Tenant-Slug) first so it tracks the
   * active organization, then optional TENANT_SLUG env, then oldest tenant.
   */
  private async resolveTenant(slugHint?: string): Promise<TenantDocument | null> {
    const normalizedHint = slugHint?.trim().toLowerCase();
    if (normalizedHint) {
      const byHeader = await this.tenantModel.findOne({ slug: normalizedHint }).exec();
      if (byHeader) return byHeader;
    }

    const envSlug = process.env.TENANT_SLUG?.trim().toLowerCase();
    if (envSlug) {
      return this.tenantModel.findOne({ slug: envSlug }).exec();
    }

    return this.tenantModel.findOne().sort({ createdAt: 1 }).exec();
  }

  async getLandingData(slugHint?: string) {
    const tenant = await this.resolveTenant(slugHint);
    const tenantId = tenant?._id;

    const [products, categories, blogs] = await Promise.all([
      this.productModel
        .find()
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
        .exec(),
      this.categoryModel
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .exec(),
      tenantId
        ? this.blogModel
            .find({ tenantId, status: BlogStatus.PUBLISHED })
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(3)
            .lean()
            .exec()
        : Promise.resolve([]),
    ]);

    return {
      products,
      categories,
      config: tenant?.landingConfig ?? {},
      blogs,
    };
  }

  async getPublishedBlogs(
    pageStr?: string,
    limitStr?: string,
    slugHint?: string,
  ): Promise<{ data: Blog[]; pagination: PublicBlogsPagination }> {
    const tenant = await this.resolveTenant(slugHint);
    if (!tenant?._id) {
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitStr ?? '10', 10) || 10));
    const filter = { tenantId: tenant._id, status: BlogStatus.PUBLISHED };
    const skip = (page - 1) * limit;

    const total = await this.blogModel.countDocuments(filter).exec();
    const data = await this.blogModel
      .find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getPublishedBlogById(id: string, slugHint?: string): Promise<Blog> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Blog not found');
    }

    const tenant = await this.resolveTenant(slugHint);
    if (!tenant?._id) {
      throw new NotFoundException('Blog not found');
    }

    const blog = await this.blogModel
      .findOne({
        _id: id,
        tenantId: tenant._id,
        status: BlogStatus.PUBLISHED,
      })
      .exec();

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }
}
