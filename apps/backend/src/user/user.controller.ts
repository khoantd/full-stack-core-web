import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { CurrentTenant, SkipTenantGuard } from 'src/guards/tenant.decorator';
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';
import { UserService } from './user.service';

@UseGuards(AuthGuard, TenantGuard, RolesGuard)
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin', 'superadmin', 'manager')
  async getAllUsers(
    @CurrentTenant() tenantId: string,
    @Query() query: { page?: string; limit?: string; search?: string; role?: string },
  ) {
    return this.userService.findAll({ ...query, tenantId });
  }

  @Get('roles')
  async getAllRoles() {
    return this.userService.findAllRoles();
  }

  @Get('me')
  async getMe(@Req() req) {
    return this.userService.getMe(req.email);
  }

  @Get('me/preferences')
  async getPreferences(@Req() req) {
    return this.userService.getPreferences(req.email);
  }

  @Put('me/preferences')
  async updatePreferences(
    @Req() req,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
    @Body()
    body: {
      language?: string;
      timezone?: string;
      emailNotifications?: boolean;
      dashboardAlerts?: boolean;
    },
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.updatePreferences(req.email, body, actor);
  }

  @Get('me/security-status')
  async checkSecurityStatus(@Req() req) {
    return this.userService.checkSecurityStatus(req.email);
  }

  @Put('me/security-confirm')
  async updateSecurityConfirm(
    @Req() req,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
    @Body() body: { securityConfirmed: boolean },
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.updateSecurityConfirm(req.email, body, actor);
  }

  @Get('stats/dashboard')
  @SkipTenantGuard()
  async getDashboardStats(@CurrentTenant() tenantId: string) {
    return this.userService.getDashboardStats(tenantId);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.userService.findById(id, tenantId);
  }

  @Post()
  @Roles('admin', 'superadmin', 'manager')
  async createUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
    @Body()
    body: {
      name: string;
      email: string;
      password?: string;
      uid?: string;
      role?: string;
      securityConfirmed?: boolean;
    },
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.create({ ...body, tenantId }, actor);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
    @Body()
    body: {
      name?: string;
      email?: string;
      password?: string;
      uid?: string;
      role?: string;
      securityConfirmed?: boolean;
    },
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.update(id, body, tenantId, actor);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.delete(id, tenantId, actor);
  }

  @Put(':id/deactivate')
  async deactivateUser(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.deactivate(id, tenantId, actor);
  }

  @Put(':id/activate')
  async activateUser(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.userService.activate(id, tenantId, actor);
  }
}

