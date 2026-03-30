import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { CategoryProductModule } from '../category-product/category-product.module';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoryProductModule,
    TenantModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, TenantGuard],
  exports: [ProductService],
})
export class ProductModule {}
