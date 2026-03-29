import { Body, Controller, Get, Param, Put, Post, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { AuthGuard } from 'src/guards/auth.guard';

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
  async update(@Param('key') key: string, @Body() body: { value: any }) {
    return this.settingsService.update(key, body.value);
  }

  @Post('bulk')
  async bulkUpdate(@Body() body: { settings: Array<{ key: string; value: any }> }) {
    return this.settingsService.updateBulk(body.settings);
  }
}
