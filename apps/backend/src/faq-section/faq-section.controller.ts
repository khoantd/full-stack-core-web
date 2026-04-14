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
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';
import { CreateFaqSectionDto } from './dto/create-faq-section.dto';
import { QueryFaqSectionDto } from './dto/query-faq-section.dto';
import { UpdateFaqSectionDto } from './dto/update-faq-section.dto';
import { FaqSectionService } from './faq-section.service';

@UseGuards(AuthGuard, TenantGuard)
@Controller('/faq-sections')
export class FaqSectionController {
  constructor(private readonly faqSectionService: FaqSectionService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(
    @Query() query: QueryFaqSectionDto,
    @CurrentTenant() tenantId: string,
    @Query('locale') locale?: string,
  ) {
    return this.faqSectionService.findAll(query, tenantId, locale);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.faqSectionService.findById(id, tenantId, locale);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateFaqSectionDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.faqSectionService.create(dto, tenantId, actor, locale);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFaqSectionDto,
    @Query('locale') locale: string | undefined,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.faqSectionService.update(id, dto, tenantId, actor, locale);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.faqSectionService.delete(id, tenantId, actor);
  }
}
