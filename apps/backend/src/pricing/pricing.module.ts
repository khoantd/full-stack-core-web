import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { Pricing, PricingSchema } from './schemas/pricing.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pricing.name, schema: PricingSchema }]),
    TenantModule,
  ],
  controllers: [PricingController],
  providers: [PricingService, TenantGuard],
  exports: [PricingService],
})
export class PricingModule {}

