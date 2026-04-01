import {
  Body, Controller, Delete, Get, Param, Post, Put, Patch,
  UseGuards, UsePipes, ValidationPipe, Req, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateFeaturesDto } from './dto/update-features.dto';
import { UpdateLandingConfigDto } from './dto/update-landing-config.dto';
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

  // Static path segments before :id so "my" is never treated as an ObjectId route param.
  @Patch('my/features')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  updateMyFeatures(@Req() req: any, @Body() dto: UpdateFeaturesDto) {
    const tenantId = req.user?.tenantId;
    if (!tenantId || !Types.ObjectId.isValid(String(tenantId))) {
      throw new BadRequestException('Missing or invalid tenant');
    }
    return this.tenantService.update(String(tenantId), { enabledFeatures: dto.enabledFeatures });
  }

  @Patch('my/landing')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  updateMyLanding(@Req() req: any, @Body() dto: UpdateLandingConfigDto) {
    const tenantId = req.user?.tenantId;
    if (!tenantId || !Types.ObjectId.isValid(String(tenantId))) {
      throw new BadRequestException('Missing or invalid tenant');
    }
    return this.tenantService.updateLandingConfig(String(tenantId), dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenant = await this.tenantService.findById(id);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
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

  @Delete(':id')
  @Roles('admin', 'owner', 'superadmin')
  delete(@Param('id') id: string) {
    return this.tenantService.delete(id);
  }
}
