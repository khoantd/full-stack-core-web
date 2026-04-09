import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { TenantModule } from '../tenant/tenant.module';
import { CategoryProduct, CategoryProductSchema } from '../category-product/schemas/category-product.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { Blog, BlogSchema } from '../blog/schemas/blog.schema';
import { BlogVersion, BlogVersionSchema } from '../blog/schemas/blog-version.schema';
import { Service, ServiceSchema } from '../service/schemas/service.schema';
import { Role, RoleSchema } from '../auth/schemas/role.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { TenantMembershipModule } from '../tenant-membership/tenant-membership.module';
import { TenantMembership, TenantMembershipSchema } from '../tenant-membership/schemas/tenant-membership.schema';

@Module({
  imports: [
    TenantModule,
    TenantMembershipModule,
    MongooseModule.forFeature([
      { name: CategoryProduct.name, schema: CategoryProductSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: BlogVersion.name, schema: BlogVersionSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: TenantMembership.name, schema: TenantMembershipSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
