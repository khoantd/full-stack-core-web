import {
  Body, Controller, Delete, Get, Param, Post, Put, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { ServiceService, PaginationResult } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(
    @Query() query: QueryServiceDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginationResult> {
    return this.serviceService.findAll(query, tenantId);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.serviceService.findById(id, tenantId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateServiceDto, @CurrentTenant() tenantId: string) {
    return this.serviceService.create(dto, tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.serviceService.update(id, dto, tenantId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.serviceService.delete(id, tenantId);
  }
}
