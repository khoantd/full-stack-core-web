import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantModule } from 'src/tenant/tenant.module';
import { TenantGuard } from 'src/guards/tenant.guard';
import { BlogCategoryController } from './blog-category.controller';
import { BlogCategoryService } from './blog-category.service';
import { BlogCategory, BlogCategorySchema } from './schemas/blog-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogCategory.name, schema: BlogCategorySchema }]),
    TenantModule,
  ],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService, TenantGuard],
  exports: [BlogCategoryService],
})
export class BlogCategoryModule {}
