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
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { UserService } from './user.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🟢 GET all users với phân trang và search (scoped to tenant)
  // Query params:
  //   - ?page=1&limit=10&search=tên (có phân trang)
  //   - ?page=all&search=tên (lấy tất cả, không phân trang)
  @Get()
  @Roles('admin', 'superadmin', 'manager')
  async getAllUsers(
    @Req() req,
    @Query() query: { page?: string; limit?: string; search?: string; role?: string },
  ) {
    return this.userService.findAll({ ...query, tenantId: req.user?.tenantId });
  }

  // 🟢 GET all roles
  @Get('roles')
  async getAllRoles() {
    return this.userService.findAllRoles();
  }

  // 🟢 GET /users/me — current user profile
  @Get('me')
  async getMe(@Req() req) {
    return this.userService.getMe(req.email);
  }

  // 🟢 GET /users/me/preferences
  @Get('me/preferences')
  async getPreferences(@Req() req) {
    return this.userService.getPreferences(req.email);
  }

  // 🟡 PUT /users/me/preferences
  @Put('me/preferences')
  async updatePreferences(
    @Req() req,
    @Body()
    body: {
      language?: string;
      timezone?: string;
      emailNotifications?: boolean;
      dashboardAlerts?: boolean;
    },
  ) {
    return this.userService.updatePreferences(req.email, body);
  }

  // 🟢 GET check securityConfirmed status của user hiện tại
  @Get('me/security-status')
  async checkSecurityStatus(@Req() req) {
    const email = req.email; // Lấy từ token qua AuthGuard
    return this.userService.checkSecurityStatus(email);
  }

  // 🟡 PUT update securityConfirmed
  @Put('me/security-confirm')
  async updateSecurityConfirm(
    @Req() req,
    @Body() body: { securityConfirmed: boolean },
  ) {
    const email = req.email; // Lấy từ token qua AuthGuard
    return this.userService.updateSecurityConfirm(email, body);
  }

  // 📊 GET - Dashboard statistics
  @Get('stats/dashboard')
  async getDashboardStats() {
    return this.userService.getDashboardStats();
  }

  // 🟢 GET user by ID
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // 🟢 POST - Tạo mới user (scoped to tenant)
  @Post()
  @Roles('admin', 'superadmin', 'manager')
  async createUser(
    @Req() req,
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
    return this.userService.create({ ...body, tenantId: req.user?.tenantId });
  }

  // 🟡 PUT - Cập nhật user
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
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
    return this.userService.update(id, body);
  }

  // 🔴 DELETE - Xóa user
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  // 🔴 PATCH - Deactivate user (invalidate refresh tokens)
  @Put(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }

  // 🟢 PATCH - Activate user
  @Put(':id/activate')
  async activateUser(@Param('id') id: string) {
    return this.userService.activate(id);
  }
}

