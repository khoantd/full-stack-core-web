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

  /**
   * GET /blogs
   * Get all blogs with pagination and search
   * Query params:
   *   - page: number | "all" (default: 1)
   *   - limit: number (default: 10)
   *   - search: string (search by title, case insensitive)
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllBlogs(@Query() query: QueryBlogDto): Promise<PaginationResult> {
    return this.blogService.findAll(query);
  }

  /**
   * GET /blogs/:id
   * Get blog by ID
   */
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  /**
   * POST /blogs
   * Create new blog
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  /**
   * PUT /blogs/:id
   * Update blog by ID
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  /**
   * DELETE /blogs/:id
   * Delete blog by ID
   */
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return this.blogService.delete(id);
  }
}
