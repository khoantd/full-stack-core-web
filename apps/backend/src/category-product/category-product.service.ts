import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CategoryProduct, CategoryProductDocument } from './schemas/category-product.schema';
import { CreateCategoryProductDto } from './dto/create-category-product.dto';
import { UpdateCategoryProductDto } from './dto/update-category-product.dto';
import { QueryCategoryProductDto } from './dto/query-category-product.dto';

@Injectable()
export class CategoryProductService {
  constructor(
    @InjectModel(CategoryProduct.name)
    private categoryProductModel: Model<CategoryProductDocument>,
  ) {}

  async create(createCategoryProductDto: CreateCategoryProductDto): Promise<CategoryProduct> {
    try {
      if (createCategoryProductDto.parent) {
        await this.validateDepth(createCategoryProductDto.parent, 1);
      }
      const createdCategoryProduct = new this.categoryProductModel(createCategoryProductDto);
      return await createdCategoryProduct.save();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error.code === 11000) throw new BadRequestException('Category with this name already exists');
      throw error;
    }
  }

  async findAll(queryDto: QueryCategoryProductDto) {
    const { page = '1', limit = '10', search } = queryDto;
    const query: any = {};

    if (search) query.name = { $regex: search, $options: 'i' };

    if (page === 'all') {
      const data = await this.categoryProductModel.find(query).populate('parent', 'name').sort({ createdAt: -1 }).exec();
      return { data, pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.categoryProductModel.find(query).populate('parent', 'name').sort({ createdAt: -1 }).skip(skip).limit(limitNum).exec(),
      this.categoryProductModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    return { data, pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 } };
  }

  async findOne(id: string): Promise<CategoryProduct> {
    const categoryProduct = await this.categoryProductModel.findById(id).populate('parent', 'name').exec();
    if (!categoryProduct) throw new NotFoundException(`Category with ID ${id} not found`);
    return categoryProduct;
  }

  async update(id: string, updateCategoryProductDto: UpdateCategoryProductDto): Promise<CategoryProduct> {
    try {
      if (updateCategoryProductDto.parent) {
        if (updateCategoryProductDto.parent === id) throw new BadRequestException('Category cannot be its own parent');
        await this.validateDepth(updateCategoryProductDto.parent, 1);
      }

      const updatedCategoryProduct = await this.categoryProductModel
        .findByIdAndUpdate(id, updateCategoryProductDto, { new: true })
        .populate('parent', 'name')
        .exec();

      if (!updatedCategoryProduct) throw new NotFoundException(`Category with ID ${id} not found`);
      return updatedCategoryProduct;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      if (error.code === 11000) throw new BadRequestException('Category with this name already exists');
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const categoryProduct = await this.categoryProductModel.findById(id).exec();
    if (!categoryProduct) throw new NotFoundException(`Category with ID ${id} not found`);

    const Product = this.categoryProductModel.db.model('Product');
    const productCount = await Product.countDocuments({ category: id }).exec();
    if (productCount > 0) throw new BadRequestException(`Cannot delete category. It has ${productCount} product(s) associated with it.`);

    // Reassign children to parent's parent
    await this.categoryProductModel.updateMany({ parent: id }, { parent: categoryProduct.parent ?? null }).exec();
    await this.categoryProductModel.findByIdAndDelete(id).exec();
  }

  // Validate that adding a child at parentId won't exceed 3 levels
  private async validateDepth(parentId: string, currentDepth: number): Promise<void> {
    if (currentDepth >= 3) throw new BadRequestException('Category hierarchy cannot exceed 3 levels deep');
    const parent = await this.categoryProductModel.findById(parentId).exec();
    if (!parent) throw new BadRequestException(`Parent category with ID ${parentId} not found`);
    if (parent.parent) {
      await this.validateDepth(parent.parent.toString(), currentDepth + 1);
    }
  }
}
