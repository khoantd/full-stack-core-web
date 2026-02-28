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

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verify that the category exists
    const categoryExists = await this.categoryProductModel.findById(createProductDto.category).exec();
    if (!categoryExists) {
      throw new BadRequestException(`Category with ID ${createProductDto.category} not found`);
    }

    const createdProduct = new this.productModel(createProductDto);
    return await createdProduct.save();
  }

  async findAll(queryDto: QueryProductDto) {
    const { page = '1', limit = '10', search, categoryId } = queryDto;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (categoryId) {
      query.category = categoryId;
    }

    if (page === 'all') {
      const data = await this.productModel
        .find(query)
        .populate('category')
        .sort({ createdAt: -1 })
        .exec();

      return {
        data,
        pagination: {
          total: data.length,
          page: 'all',
          limit: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // If updating category, verify it exists
    if (updateProductDto.category) {
      const categoryExists = await this.categoryProductModel.findById(updateProductDto.category).exec();
      if (!categoryExists) {
        throw new BadRequestException(`Category with ID ${updateProductDto.category} not found`);
      }
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productModel.findByIdAndDelete(id).exec();
  }
}
