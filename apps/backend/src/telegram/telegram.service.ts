import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { AutomakerService, OnProgressCallback } from '../automaker/automaker.service';

export interface ParsedMessage {
  title: string;
  description: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf | null = null;

  constructor(
    private readonly automakerService: AutomakerService,
    private readonly configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.bot = new Telegraf(token);
    }
  }

  /** Send a notification message to the configured admin chat */
  async sendNotification(message: string): Promise<void> {
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!this.bot || !chatId) {
      this.logger.warn('Telegram bot or chat ID not configured, skipping notification');
      return;
    }
    try {
      await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (err) {
      this.logger.error(`Failed to send Telegram notification: ${err.message}`);
    }
  }

  async notifyPaymentFailed(orderId: string, amount: number, reason?: string): Promise<void> {
    await this.sendNotification(
      `❌ <b>Payment Failed</b>\nOrder: <code>${orderId}</code>\nAmount: $${amount}\n${reason ? `Reason: ${reason}` : ''}`,
    );
  }

  async notifyNewUser(email: string, name: string): Promise<void> {
    await this.sendNotification(
      `👤 <b>New User Registered</b>\nName: ${name}\nEmail: <code>${email}</code>`,
    );
  }

  async notifySystemError(service: string, error: string): Promise<void> {
    await this.sendNotification(
      `🚨 <b>System Error</b>\nService: ${service}\nError: ${error}`,
    );
  }

  parseMessageForAutomaker(text: string, botUsername?: string): ParsedMessage {
    let content = text.trim();
    if (botUsername) {
      const mention = `@${botUsername.replace('@', '')}`;
      content = content.replace(new RegExp(mention, 'gi'), '').trim();
    }
    return {
      title: 'Chỉnh sửa hệ thống',
      description: content || '(Không có nội dung)',
    };
  }

  isBotMentioned(text: string | undefined, botUsername: string): boolean {
    if (!text) return false;
    const mention = `@${botUsername.replace('@', '')}`;
    return text.toLowerCase().includes(mention.toLowerCase());
  }

  async sendToAutomaker(
    title: string,
    description: string,
    onProgress?: OnProgressCallback,
  ) {
    return this.automakerService.createWithTitleAndDescription(
      { title, description },
      onProgress,
    );
  }
}
