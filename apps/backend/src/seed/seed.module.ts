import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { TenantModule } from '../tenant/tenant.module';
import { CategoryProduct, CategoryProductSchema } from '../category-product/schemas/category-product.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { Blog, BlogSchema } from '../blog/schemas/blog.schema';
import { BlogVersion, BlogVersionSchema } from '../blog/schemas/blog-version.schema';
import { Service, ServiceSchema } from '../service/schemas/service.schema';

@Module({
  imports: [
    TenantModule,
    MongooseModule.forFeature([
      { name: CategoryProduct.name, schema: CategoryProductSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: BlogVersion.name, schema: BlogVersionSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
