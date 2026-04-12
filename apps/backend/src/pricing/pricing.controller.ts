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
import { CreatePricingDto } from './dto/create-pricing.dto';
import { QueryPricingDto } from './dto/query-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PricingService } from './pricing.service';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/pricings')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(
    @Query() query: QueryPricingDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.pricingService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pricingService.findById(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreatePricingDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pricingService.create(dto, tenantId, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePricingDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pricingService.update(id, dto, tenantId, locale);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.pricingService.delete(id, tenantId);
  }
}

