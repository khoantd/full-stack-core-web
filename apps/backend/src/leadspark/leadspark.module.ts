import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadSparkController } from './leadspark.controller';
import { LeadSparkService } from './leadspark.service';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    TenantModule,
  ],
  controllers: [LeadSparkController],
  providers: [LeadSparkService, TenantGuard],
})
export class LeadSparkModule {}
