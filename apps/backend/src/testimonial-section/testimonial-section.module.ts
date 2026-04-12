import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestimonialSectionController } from './testimonial-section.controller';
import { TestimonialSectionPublicController } from './testimonial-section-public.controller';
import { TestimonialSectionService } from './testimonial-section.service';
import { TestimonialSection, TestimonialSectionSchema } from './schemas/testimonial-section.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';
import { ApiKeyModule } from '../api-key/api-key.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestimonialSection.name, schema: TestimonialSectionSchema }]),
    TenantModule,
    ApiKeyModule, // PublicIntegrationAuthGuard + ApiKeyService
  ],
  controllers: [TestimonialSectionController, TestimonialSectionPublicController],
  providers: [TestimonialSectionService, TenantGuard],
  exports: [TestimonialSectionService],
})
export class TestimonialSectionModule {}
