import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, type ProductTranslatableFields } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CategoryProduct, CategoryProductDocument } from '../category-product/schemas/category-product.schema';
import { overlayTranslatedFields, upsertTranslation } from '../common/i18n/translations';
import { AuditLogService } from '../audit-log/audit-log.service';
import { buildCreateDiff, buildDeleteDiff, buildUpdateDiff } from '../audit-log/audit-log.diff';
import { ActorContext } from '../audit-log/audit-log.types';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(CategoryProduct.name)
    private categoryProductModel: Model<CategoryProductDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    tenantId: string,
    actor: ActorContext,
    locale?: string,
  ): Promise<Product> {
    const categoryExists = await this.categoryProductModel
      .findOne({ _id: createProductDto.category, tenantId })
      .exec();
    if (!categoryExists) throw new BadRequestException(`Category with ID ${createProductDto.category} not found`);

    const data: any = { ...createProductDto, tenantId };
    data.isOutOfStock = (data.stock ?? 0) === 0;
    if (locale) {
      const patch: Partial<ProductTranslatableFields> = {
        name: data.name,
        description: data.description,
      };
      data.translations = upsertTranslation<ProductTranslatableFields>(data.translations, locale, patch);
    }

    const createdProduct = new this.productModel(data);
    const saved = await createdProduct.save();

    await this.auditLogService.create({
      tenantId,
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'CREATE',
      entity: 'Product',
      entityId: String(saved._id),
      diff: buildCreateDiff(createProductDto as unknown as Record<string, unknown>),
      description: `Created product ${saved._id}`,
    });

    return saved;
  }

  async findAll(queryDto: QueryProductDto, tenantId: string, locale?: string) {
    const { page = '1', limit = '10', search, categoryId } = queryDto;
    const query: any = { tenantId };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (categoryId) query.category = categoryId;

    if (page === 'all') {
      const data = await this.productModel.find(query).populate('category').sort({ createdAt: -1 }).lean().exec();
      return {
        data: data.map((p: any) => overlayTranslatedFields(p, p.translations, locale)),
        pagination: { total: data.length, page: 'all', limit: data.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.productModel.find(query).populate('category').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    return {
      data: data.map((p: any) => overlayTranslatedFields(p, p.translations, locale)),
      pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    };
  }

  async findOne(id: string, tenantId: string, locale?: string): Promise<any> {
    const product = await this.productModel.findOne({ _id: id, tenantId }).populate('category').lean().exec();
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return overlayTranslatedFields(product as any, (product as any).translations, locale);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    tenantId: string,
    actor: ActorContext,
    locale?: string,
  ): Promise<Product> {
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

    const product = await this.productModel.findOne({ _id: id, tenantId }).exec();
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);

    const before = product.toObject() as unknown as Record<string, unknown>;
    Object.assign(product, updateData);

    if (locale) {
      const patch: Partial<ProductTranslatableFields> = {};
      if (updateProductDto.name !== undefined) patch.name = product.name;
      if (updateProductDto.description !== undefined) patch.description = product.description;

      product.translations = upsertTranslation<ProductTranslatableFields>(
        product.translations as any,
        locale,
        patch,
      ) as any;
    }

    await product.save();
    const after = product.toObject() as unknown as Record<string, unknown>;

    const reloaded = await this.productModel
      .findOne({ _id: id, tenantId })
      .populate('category')
      .exec();
    if (!reloaded) throw new NotFoundException(`Product with ID ${id} not found`);

    await this.auditLogService.create({
      tenantId,
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'UPDATE',
      entity: 'Product',
      entityId: String(id),
      diff: buildUpdateDiff({
        before,
        after,
        patch: updateProductDto as unknown as Record<string, unknown>,
      }),
      description: `Updated product ${id}`,
    });

    return reloaded;
  }

  async remove(id: string, tenantId: string, actor: ActorContext): Promise<void> {
    const product = await this.productModel.findOneAndDelete({ _id: id, tenantId }).lean().exec();
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);

    await this.auditLogService.create({
      tenantId,
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'DELETE',
      entity: 'Product',
      entityId: String(id),
      diff: buildDeleteDiff(product as unknown as Record<string, unknown>, {
        allowlist: ['_id', 'name', 'category', 'stock'],
      }),
      description: `Deleted product ${id}`,
    });
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
        const actor: ActorContext = { tenantId, userId: 'system', userEmail: 'system' };
        await this.create(products[i], tenantId, actor);
        success++;
      } catch (err: any) {
        errors.push({ row: i + 1, message: err.message || 'Unknown error' });
      }
    }

    return { success, errors };
  }
}
