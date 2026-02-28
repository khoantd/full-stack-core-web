import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryProductController } from './category-product.controller';
import { CategoryProductService } from './category-product.service';
import { CategoryProduct, CategoryProductSchema } from './schemas/category-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryProduct.name, schema: CategoryProductSchema },
    ]),
  ],
  controllers: [CategoryProductController],
  providers: [CategoryProductService],
  exports: [CategoryProductService, MongooseModule],
})
export class CategoryProductModule {}
