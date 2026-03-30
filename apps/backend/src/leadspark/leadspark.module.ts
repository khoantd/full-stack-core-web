import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadSparkController } from './leadspark.controller';
import { LeadSparkService } from './leadspark.service';
import { Product, ProductSchema } from '../product/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [LeadSparkController],
  providers: [LeadSparkService],
})
export class LeadSparkModule {}
