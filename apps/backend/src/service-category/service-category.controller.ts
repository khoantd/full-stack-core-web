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
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { QueryServiceCategoryDto } from './dto/query-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { ServiceCategoryService } from './service-category.service';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/service-categories')
export class ServiceCategoryController {
  constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(
    @Query() queryDto: QueryServiceCategoryDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.serviceCategoryService.findAll(queryDto, tenantId, locale);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.serviceCategoryService.findOne(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(
    @Body() dto: CreateServiceCategoryDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.serviceCategoryService.create(dto, tenantId, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceCategoryDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.serviceCategoryService.update(id, dto, tenantId, locale);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    await this.serviceCategoryService.remove(id, tenantId);
    return { message: 'Service category deleted successfully', id };
  }
}

