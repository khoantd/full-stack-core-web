import {
  Body, Controller, Delete, Get, Param, Post, Put, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';
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
    @Query('locale') locale?: string,
  ): Promise<PaginationResult> {
    return this.serviceService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.serviceService.findById(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateServiceDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = {
      tenantId,
      userId: String(user?.uid ?? user?._id ?? user?.id ?? ''),
      userEmail: String(user?.email ?? ''),
    };
    return this.serviceService.create(dto, tenantId, actor, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = {
      tenantId,
      userId: String(user?.uid ?? user?._id ?? user?.id ?? ''),
      userEmail: String(user?.email ?? ''),
    };
    return this.serviceService.update(id, dto, tenantId, actor, locale);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = {
      tenantId,
      userId: String(user?.uid ?? user?._id ?? user?.id ?? ''),
      userEmail: String(user?.email ?? ''),
    };
    return this.serviceService.delete(id, tenantId, actor);
  }
}
