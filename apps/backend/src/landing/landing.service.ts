import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
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
   * Resolves tenant for public landing: X-Tenant-Slug, then TENANT_SLUG env, then oldest tenant.
   * If a slug does not match any row (typo / stale env), falls back to oldest tenant so the
   * public site does not stay empty.
   */
  private async resolveTenant(slugHint?: string): Promise<TenantDocument | null> {
    const findBySlug = (slug: string) =>
      this.tenantModel.findOne({ slug: slug.trim().toLowerCase() }).exec();

    const normalizedHint = slugHint?.trim().toLowerCase();
    if (normalizedHint) {
      const byHeader = await findBySlug(normalizedHint);
      if (byHeader) return byHeader;
    }

    const envSlug = process.env.TENANT_SLUG?.trim().toLowerCase();
    if (envSlug) {
      const byEnv = await findBySlug(envSlug);
      if (byEnv) return byEnv;
    }

    return this.tenantModel.findOne().sort({ createdAt: 1 }).exec();
  }

  /**
   * Some blog documents store tenantId as a string; authenticated /blogs uses JWT string and matches.
   * Public landing used tenant._id (ObjectId), which does not match string tenantId in MongoDB.
   */
  private tenantIdBlogMatch(tenantId: Types.ObjectId): FilterQuery<Blog> {
    const id = tenantId;
    return {
      $or: [{ tenantId: id }, { tenantId: id.toString() }],
    };
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
            .find({
              status: BlogStatus.PUBLISHED,
              ...this.tenantIdBlogMatch(tenantId),
            })
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
    const filter: FilterQuery<Blog> = {
      status: BlogStatus.PUBLISHED,
      ...this.tenantIdBlogMatch(tenant._id),
    };
    const skip = (page - 1) * limit;

    const total = await this.blogModel.countDocuments(filter).exec();
    const data = await this.blogModel
      .find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: data as unknown as Blog[],
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
        status: BlogStatus.PUBLISHED,
        ...this.tenantIdBlogMatch(tenant._id),
      })
      .lean()
      .exec();

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog as unknown as Blog;
  }
}
