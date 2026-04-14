import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantModule } from 'src/tenant/tenant.module';
import { TenantGuard } from 'src/guards/tenant.guard';
import { ServiceCategoryController } from './service-category.controller';
import { ServiceCategoryService } from './service-category.service';
import { ServiceCategory, ServiceCategorySchema } from './schemas/service-category.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServiceCategory.name, schema: ServiceCategorySchema }]),
    TenantModule,
    AuditLogModule,
  ],
  controllers: [ServiceCategoryController],
  providers: [ServiceCategoryService, TenantGuard],
  exports: [ServiceCategoryService],
})
export class ServiceCategoryModule {}

