import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { CategoryProductService } from './category-product.service';
import { CreateCategoryProductDto } from './dto/create-category-product.dto';
import { UpdateCategoryProductDto } from './dto/update-category-product.dto';
import { QueryCategoryProductDto } from './dto/query-category-product.dto';

@UseGuards(AuthGuard, TenantGuard)
@Controller('category-products')
export class CategoryProductController {
  constructor(private readonly categoryProductService: CategoryProductService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createCategoryProductDto: CreateCategoryProductDto, @CurrentTenant() tenantId: string) {
    return this.categoryProductService.create(createCategoryProductDto, tenantId);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() queryDto: QueryCategoryProductDto, @CurrentTenant() tenantId: string) {
    return this.categoryProductService.findAll(queryDto, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.categoryProductService.findOne(id, tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateCategoryProductDto: UpdateCategoryProductDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.categoryProductService.update(id, updateCategoryProductDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.categoryProductService.remove(id, tenantId);
  }
}
