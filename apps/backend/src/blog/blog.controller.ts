import {
  Body, Controller, Delete, Get, Param, Post, Put, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { BlogService, PaginationResult } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllBlogs(
    @Query() query: QueryBlogDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginationResult> {
    return this.blogService.findAll(query, tenantId);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.blogService.findById(id, tenantId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBlog(@Body() dto: CreateBlogDto, @CurrentTenant() tenantId: string) {
    return this.blogService.create(dto, tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.blogService.update(id, dto, tenantId);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.blogService.delete(id, tenantId);
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.blogService.getVersions(id, tenantId);
  }

  @Post(':id/versions/:versionId/restore')
  async restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.blogService.restoreVersion(id, versionId, tenantId);
  }
}
