import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestimonialSectionController } from './testimonial-section.controller';
import { TestimonialSectionService } from './testimonial-section.service';
import { TestimonialSection, TestimonialSectionSchema } from './schemas/testimonial-section.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestimonialSection.name, schema: TestimonialSectionSchema }]),
    TenantModule,
  ],
  controllers: [TestimonialSectionController],
  providers: [TestimonialSectionService, TenantGuard],
  exports: [TestimonialSectionService],
})
export class TestimonialSectionModule {}
