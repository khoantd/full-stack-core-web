import { Body, Controller, Get, Param, Put, Post, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser, RequestUser } from 'src/guards/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  async getOne(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Put(':key')
  async update(
    @Param('key') key: string,
    @Body() body: { value: any },
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const tenantId = String(user?.tenantId ?? 'global');
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.settingsService.update(key, body.value, actor);
  }

  @Post('bulk')
  async bulkUpdate(
    @Body() body: { settings: Array<{ key: string; value: any }> },
    @CurrentUser() user: RequestUser | undefined,
  ) {
    const tenantId = String(user?.tenantId ?? 'global');
    const actor = { tenantId, userId: String(user?._id ?? user?.id ?? ''), userEmail: String(user?.email ?? '') };
    return this.settingsService.updateBulk(body.settings, actor);
  }
}
