import {
  Body, Controller, Delete, Get, Param, Post, Put, Patch,
  UseGuards, UsePipes, ValidationPipe, Req, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateFeaturesDto } from './dto/update-features.dto';
import { UpdateLandingConfigDto } from './dto/update-landing-config.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { AuthService } from '../auth/auth.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll(@Req() req: any) {
    return this.tenantService.findAllForUserEmail(req.user?.email);
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

  @Post('my/switch')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  switchMyTenant(@Req() req: any, @Body() dto: SwitchTenantDto) {
    const email = req.user?.email;
    return this.authService.switchTenant({ email, tenantId: dto.tenantId });
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
  create(@Req() req: any, @Body() dto: CreateTenantDto) {
    return this.tenantService.createForUserEmail(dto, req.user?.email);
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
