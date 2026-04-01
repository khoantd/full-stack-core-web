import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LandingService } from './landing.service';

function tenantSlugFromRequest(req: Request): string | undefined {
  const raw = req.headers['x-tenant-slug'];
  const s = Array.isArray(raw) ? raw[0] : raw;
  const v = typeof s === 'string' ? s.trim() : '';
  return v || undefined;
}

@Controller('landing')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get()
  getData(@Req() req: Request) {
    return this.landingService.getLandingData(tenantSlugFromRequest(req));
  }

  @Get('blogs')
  getBlogs(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.landingService.getPublishedBlogs(page, limit, tenantSlugFromRequest(req));
  }

  @Get('blogs/:id')
  getBlogById(@Req() req: Request, @Param('id') id: string) {
    return this.landingService.getPublishedBlogById(id, tenantSlugFromRequest(req));
  }
}
