import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ValidationPipe, UsePipes, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@UseGuards(AuthGuard, TenantGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() dto: CreateProductDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
    @Query('locale') locale: string | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.productService.create(dto, tenantId, actor, locale);
  }

  @Post('bulk-import')
  @UsePipes(new ValidationPipe({ transform: true }))
  bulkImport(@Body() body: { products: CreateProductDto[] }, @CurrentTenant() tenantId: string) {
    return this.productService.bulkImport(body.products, tenantId);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(
    @Query() queryDto: QueryProductDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale: string | undefined,
  ) {
    return this.productService.findAll(queryDto, tenantId, locale);
  }

  @Get('low-stock')
  getLowStock(@CurrentTenant() tenantId: string) {
    return this.productService.getLowStockProducts(tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale: string | undefined,
  ) {
    return this.productService.findOne(id, tenantId, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
    @Query('locale') locale: string | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.productService.update(id, dto, tenantId, actor, locale);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.productService.remove(id, tenantId, actor);
  }
}
