import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { CategoryProduct, CategoryProductDocument } from '../category-product/schemas/category-product.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';

@Injectable()
export class LandingService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(CategoryProduct.name) private categoryModel: Model<CategoryProductDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async getLandingData() {
    const slug = process.env.TENANT_SLUG;
    const [products, categories, tenant] = await Promise.all([
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
      slug
        ? this.tenantModel.findOne({ slug }).exec()
        : this.tenantModel.findOne().sort({ createdAt: 1 }).exec(),
    ]);

    return { products, categories, config: tenant?.landingConfig ?? {} };
  }
}
