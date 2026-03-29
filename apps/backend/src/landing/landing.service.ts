import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { CategoryProduct, CategoryProductDocument } from '../category-product/schemas/category-product.schema';

@Injectable()
export class LandingService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(CategoryProduct.name) private categoryModel: Model<CategoryProductDocument>,
  ) {}

  async getLandingData() {
    const [products, categories] = await Promise.all([
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
    ]);

    return { products, categories };
  }
}
