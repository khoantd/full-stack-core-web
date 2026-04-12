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
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { QueryBlogCategoryDto } from './dto/query-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { BlogCategoryService } from './blog-category.service';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/blog-categories')
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(
    @Query() queryDto: QueryBlogCategoryDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.blogCategoryService.findAll(queryDto, tenantId, locale);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.blogCategoryService.findOne(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(
    @Body() dto: CreateBlogCategoryDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.blogCategoryService.create(dto, tenantId, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogCategoryDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.blogCategoryService.update(id, dto, tenantId, locale);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    await this.blogCategoryService.remove(id, tenantId);
    return { message: 'Blog category deleted successfully', id };
  }
}
