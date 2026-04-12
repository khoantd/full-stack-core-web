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
import { LandingPageService, LandingPaginationResult } from './landing-page.service';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';
import { QueryLandingPageDto } from './dto/query-landing-page.dto';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/landing-pages')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(
    @Query() query: QueryLandingPageDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ): Promise<LandingPaginationResult> {
    return this.landingPageService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.landingPageService.findById(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateLandingPageDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.landingPageService.create(dto, tenantId, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLandingPageDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.landingPageService.update(id, dto, tenantId, locale);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.landingPageService.remove(id, tenantId);
  }
}
