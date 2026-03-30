import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSettings } from './system-settings.schema';

const DEFAULTS: Array<{ key: string; value: any; group: string; description: string }> = [
  { key: 'site_name', value: 'My CMS', group: 'general', description: 'Site display name' },
  { key: 'site_description', value: '', group: 'general', description: 'Short site description' },
  { key: 'maintenance_mode', value: false, group: 'general', description: 'Enable maintenance mode' },
  { key: 'max_login_attempts', value: 5, group: 'security', description: 'Max failed logins before lockout' },
  { key: 'lockout_duration_minutes', value: 15, group: 'security', description: 'Account lockout duration in minutes' },
  { key: 'session_timeout_minutes', value: 15, group: 'security', description: 'Access token expiry (minutes)' },
  { key: 'telegram_token', value: '', group: 'integrations', description: 'Telegram bot token' },
  { key: 'telegram_chat_id', value: '', group: 'integrations', description: 'Telegram admin chat ID' },
  { key: 'notify_new_user', value: true, group: 'notifications', description: 'Notify admin on new user registration' },
  { key: 'notify_payment_fail', value: true, group: 'notifications', description: 'Notify admin on payment failure' },
];

@Injectable()
export class SystemSettingsService implements OnModuleInit {
  constructor(
    @InjectModel(SystemSettings.name)
    private readonly settingsModel: Model<SystemSettings>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    for (const d of DEFAULTS) {
      const existing = await this.settingsModel.findOne({ key: d.key });
      if (!existing) {
        await this.settingsModel.create(d);
      }
    }
  }

  async findAll() {
    const settings = await this.settingsModel.find().sort({ group: 1, key: 1 }).lean();
    // Group by section
    return settings.reduce<Record<string, any[]>>((acc, s) => {
      const g = s.group ?? 'general';
      if (!acc[g]) acc[g] = [];
      acc[g].push({ key: s.key, value: s.value, description: s.description });
      return acc;
    }, {});
  }

  async get(key: string) {
    const setting = await this.settingsModel.findOne({ key });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  async update(key: string, value: any) {
    const setting = await this.settingsModel.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true },
    );
    return setting;
  }

  async updateBulk(entries: Array<{ key: string; value: any }>) {
    const results = await Promise.all(entries.map((e) => this.update(e.key, e.value)));
    return { updated: results.length, settings: results };
  }
}
