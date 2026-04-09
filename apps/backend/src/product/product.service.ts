import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CategoryProduct, CategoryProductDocument } from '../category-product/schemas/category-product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(CategoryProduct.name)
    private categoryProductModel: Model<CategoryProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, tenantId: string): Promise<Product> {
    const categoryExists = await this.categoryProductModel
      .findOne({ _id: createProductDto.category, tenantId })
      .exec();
    if (!categoryExists) throw new BadRequestException(`Category with ID ${createProductDto.category} not found`);

    const data: any = { ...createProductDto, tenantId };
    data.isOutOfStock = (data.stock ?? 0) === 0;

    const createdProduct = new this.productModel(data);
    return await createdProduct.save();
  }

  async findAll(queryDto: QueryProductDto, tenantId: string) {
    const { page = '1', limit = '10', search, categoryId } = queryDto;
    const query: any = { tenantId };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (categoryId) query.category = categoryId;

    if (page === 'all') {
      const data = await this.productModel.find(query).populate('category').sort({ createdAt: -1 }).exec();
      return { data, pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.productModel.find(query).populate('category').sort({ createdAt: -1 }).skip(skip).limit(limitNum).exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    return { data, pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 } };
  }

  async findOne(id: string, tenantId: string): Promise<Product> {
    const product = await this.productModel.findOne({ _id: id, tenantId }).populate('category').exec();
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, tenantId: string): Promise<Product> {
    if (updateProductDto.category) {
      const categoryExists = await this.categoryProductModel
        .findOne({ _id: updateProductDto.category, tenantId })
        .exec();
      if (!categoryExists) throw new BadRequestException(`Category with ID ${updateProductDto.category} not found`);
    }

    const updateData: any = { ...updateProductDto };
    if (updateData.stock !== undefined) {
      updateData.isOutOfStock = updateData.stock === 0;
    }

    const updatedProduct = await this.productModel.findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true }).populate('category').exec();
    if (!updatedProduct) throw new NotFoundException(`Product with ID ${id} not found`);
    return updatedProduct;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const product = await this.productModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
  }

  async getLowStockProducts(tenantId: string) {
    return this.productModel.find({
      tenantId,
      $expr: { $lte: ['$stock', '$stockThreshold'] },
      isOutOfStock: false,
    }).populate('category').exec();
  }

  async bulkImport(products: CreateProductDto[], tenantId: string): Promise<{ success: number; errors: { row: number; message: string }[] }> {
    const errors: { row: number; message: string }[] = [];
    let success = 0;

    for (let i = 0; i < products.length; i++) {
      try {
        await this.create(products[i], tenantId);
        success++;
      } catch (err: any) {
        errors.push({ row: i + 1, message: err.message || 'Unknown error' });
      }
    }

    return { success, errors };
  }
}
