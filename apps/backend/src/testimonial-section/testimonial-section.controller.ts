import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { CreateTestimonialSectionDto } from './dto/create-testimonial-section.dto';
import { QueryTestimonialSectionDto } from './dto/query-testimonial-section.dto';
import { UpdateTestimonialSectionDto } from './dto/update-testimonial-section.dto';
import { TestimonialSectionService } from './testimonial-section.service';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/testimonial-sections')
export class TestimonialSectionController {
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

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateTestimonialSectionDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.testimonialSectionService.create(dto, tenantId, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialSectionDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.testimonialSectionService.update(id, dto, tenantId, locale);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.testimonialSectionService.delete(id, tenantId);
  }
}
