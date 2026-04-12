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
import { QueryTestimonialSectionDto } from './dto/query-testimonial-section.dto';
import { TestimonialSectionService } from './testimonial-section.service';

/**
 * Read-only testimonial sections for integrations (e.g. marketing site, server-side fetch).
 * Authenticate with `Authorization: Bearer <JWT>` or `x-api-key` (Dashboard → API keys).
 */
@UseGuards(PublicIntegrationAuthGuard, TenantGuard)
@Controller('public/testimonial-sections')
export class TestimonialSectionPublicController {
  constructor(private readonly testimonialSectionService: TestimonialSectionService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(
    @Query() query: QueryTestimonialSectionDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.testimonialSectionService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.testimonialSectionService.findById(id, tenantId, locale);
  }
}
