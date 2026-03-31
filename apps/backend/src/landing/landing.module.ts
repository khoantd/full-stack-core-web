import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { CategoryProduct, CategoryProductSchema } from '../category-product/schemas/category-product.schema';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: CategoryProduct.name, schema: CategoryProductSchema },
    ]),
    TenantModule,
  ],
  controllers: [LandingController],
  providers: [LandingService],
})
export class LandingModule {}
