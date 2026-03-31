import {
  Body, Controller, Delete, Get, Param, Post, Put, Patch,
  UseGuards, UsePipes, ValidationPipe, Req,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateFeaturesDto } from './dto/update-features.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Post()
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: Partial<CreateTenantDto>) {
    return this.tenantService.update(id, dto);
  }

  // Uses tenantId from JWT — no URL param needed, avoids ID mismatch
  @Patch('my/features')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updateMyFeatures(@Req() req: any, @Body() dto: UpdateFeaturesDto) {
    const tenantId = req.user?.tenantId;
    return this.tenantService.update(tenantId, { enabledFeatures: dto.enabledFeatures });
  }

  @Delete(':id')
  @Roles('superadmin')
  delete(@Param('id') id: string) {
    return this.tenantService.delete(id);
  }
}
