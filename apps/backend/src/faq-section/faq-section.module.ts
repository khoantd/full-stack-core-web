import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqSectionController } from './faq-section.controller';
import { FaqSectionPublicController } from './faq-section-public.controller';
import { FaqSectionService } from './faq-section.service';
import { FaqSection, FaqSectionSchema } from './schemas/faq-section.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';
import { ApiKeyModule } from '../api-key/api-key.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FaqSection.name, schema: FaqSectionSchema }]),
    TenantModule,
    ApiKeyModule,
    AuditLogModule,
  ],
  controllers: [FaqSectionController, FaqSectionPublicController],
  providers: [FaqSectionService, TenantGuard],
  exports: [FaqSectionService],
})
export class FaqSectionModule {}
