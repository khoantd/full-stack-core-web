import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryProductController } from './category-product.controller';
import { CategoryProductService } from './category-product.service';
import { CategoryProduct, CategoryProductSchema } from './schemas/category-product.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryProduct.name, schema: CategoryProductSchema },
    ]),
    TenantModule,
  ],
  controllers: [CategoryProductController],
  providers: [CategoryProductService, TenantGuard],
  exports: [CategoryProductService, MongooseModule],
})
export class CategoryProductModule {}
