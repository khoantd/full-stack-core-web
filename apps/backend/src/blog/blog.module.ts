import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogVersion, BlogVersionSchema } from './schemas/blog-version.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: BlogVersion.name, schema: BlogVersionSchema },
    ]),
    TenantModule,
    AuditLogModule,
  ],
  controllers: [BlogController],
  providers: [BlogService, TenantGuard],
  exports: [BlogService],
})
export class BlogModule {}
