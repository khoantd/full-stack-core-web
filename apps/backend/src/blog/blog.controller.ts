import {
  Body, Controller, Delete, Get, Param, Post, Put, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';
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
    @Query('locale') locale?: string,
  ): Promise<PaginationResult> {
    return this.blogService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getBlogById(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.blogService.findById(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBlog(
    @Body() dto: CreateBlogDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.blogService.create(dto, tenantId, actor, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.blogService.update(id, dto, tenantId, actor, locale);
  }

  @Delete(':id')
  async deleteBlog(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.blogService.delete(id, tenantId, actor);
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
