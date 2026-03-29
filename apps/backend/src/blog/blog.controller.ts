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
import { BlogService, PaginationResult } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

@UseGuards(AuthGuard)
@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllBlogs(@Query() query: QueryBlogDto): Promise<PaginationResult> {
    return this.blogService.findAll(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string) {
    return this.blogService.getVersions(id);
  }

  @Post(':id/versions/:versionId/restore')
  async restoreVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.blogService.restoreVersion(id, versionId);
  }
}
