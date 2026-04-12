import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PublicIntegrationAuthGuard } from 'src/guards/public-integration-auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { QueryFaqSectionDto } from './dto/query-faq-section.dto';
import { FaqSectionService } from './faq-section.service';

/**
 * Read-only FAQ sections for integrations (e.g. marketing site, server-side fetch).
 * Authenticate with `Authorization: Bearer <JWT>` or `x-api-key` (Dashboard → API keys).
 */
@UseGuards(PublicIntegrationAuthGuard, TenantGuard)
@Controller('public/faq-sections')
export class FaqSectionPublicController {
  constructor(private readonly faqSectionService: FaqSectionService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(
    @Query() query: QueryFaqSectionDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.faqSectionService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.faqSectionService.findById(id, tenantId, locale);
  }
}
