import { Injectable, Logger } from '@nestjs/common';
import { Update, Ctx, Message, On, Start, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { PaymentService } from '../payment/payment.service';

const TASK_RECEIVED_MSG = 'Đã nhận được yêu cầu và đang tiến hành xử lý.';
const ALLOWED_CHAT_IDS = process.env.TELEGRAM_CHAT_ID ? [process.env.TELEGRAM_CHAT_ID] : [];

/** Trích chỉ các value của field "description" từ content (agent-output). */
function extractDescriptions(content: string): string[] {
  const list: string[] = [];
  const add = (val: string) => {
    const n = val.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (n && !list.includes(n)) list.push(n);
  };
  let m: RegExpExecArray | null;
  const re1 = /"description"\s*:\s*"((?:[^"\\]|\\.)*)"/gi;
  while ((m = re1.exec(content)) !== null) add(m[1]);
  const re2 = /'description'\s*:\s*'((?:[^'\\]|\\.)*)'/gi;
  while ((m = re2.exec(content)) !== null) add(m[1]);
  const re3 = /\bdescription\s*:\s*"((?:[^"\\]|\\.)*)"/gi;
  while ((m = re3.exec(content)) !== null) add(m[1]);
  const re4 = /Input:\s*\{\s*[^}]*?"description"\s*:\s*"((?:[^"\\]|\\.)*)"/gi;
  while ((m = re4.exec(content)) !== null) add(m[1]);
  return list;
}

@Update()
@Injectable()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
  ) {}

  private isAuthorized(ctx: Context): boolean {
    if (ALLOWED_CHAT_IDS.length === 0) return true; // No restriction if not configured
    const chatId = String(ctx.chat?.id);
    return ALLOWED_CHAT_IDS.includes(chatId);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.logger.log(`[TELEGRAM] /start | chatId=${ctx.chat?.id}`);
    await ctx.reply(
      'Chào bạn! Gửi nội dung để tạo feature (title: Chỉnh sửa hệ thống, description: toàn bộ tin nhắn của bạn).\n\nVí dụ: Đổi màu banner section hero ở trang home sang màu vàng.',
    );
  }

  @Command('help')
  async onHelp(@Ctx() ctx: Context) {
    if (!this.isAuthorized(ctx)) {
      this.logger.warn(`[TELEGRAM] Unauthorized /help from chatId=${ctx.chat?.id}`);
      return;
    }
    await ctx.reply(
      '📋 <b>Available Commands</b>\n\n' +
      '/stats — Today\'s sales, new users, top products\n' +
      '/orders [status] — List orders by status (pending/success/failed)\n' +
      '/help — Show this help message\n\n' +
      'Or send any text to create a feature request.',
      { parse_mode: 'HTML' },
    );
  }

  @Command('stats')
  async onStats(@Ctx() ctx: Context) {
    if (!this.isAuthorized(ctx)) {
      this.logger.warn(`[TELEGRAM] Unauthorized /stats from chatId=${ctx.chat?.id}`);
      return;
    }
    try {
      const [userStats, payments, products] = await Promise.all([
        this.userService.getDashboardStats(),
        this.paymentService.findAll({ page: '1', limit: '5' }),
        this.productService.findAll({ page: '1', limit: '5' }, ''),
      ]);

      const todaySales = payments.data
        ?.filter((p: any) => {
          const d = new Date(p.createdAt);
          const now = new Date();
          return d.toDateString() === now.toDateString();
        })
        .reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0) ?? 0;

      const topProducts = products.data?.slice(0, 3).map((p: any) => `• ${p.name}`).join('\n') ?? 'N/A';

      await ctx.reply(
        `📊 <b>CMS Stats</b>\n\n` +
        `👥 Total Users: ${userStats?.totalUsers ?? 'N/A'}\n` +
        `🆕 New Users (today): ${userStats?.newTodayUsers ?? 'N/A'}\n` +
        `💰 Sales (today): $${todaySales.toFixed(2)}\n\n` +
        `🏆 <b>Top Products:</b>\n${topProducts}`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to fetch stats: ${err.message}`);
    }
  }

  @Command('orders')
  async onOrders(@Ctx() ctx: Context) {
    if (!this.isAuthorized(ctx)) {
      this.logger.warn(`[TELEGRAM] Unauthorized /orders from chatId=${ctx.chat?.id}`);
      return;
    }
    try {
      const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const parts = text.split(' ');
      const status = parts[1] ?? undefined;

      const result = await this.paymentService.findAll({ page: '1', limit: '10', status });
      const orders = result.data ?? [];

      if (orders.length === 0) {
        await ctx.reply(`No orders found${status ? ` with status "${status}"` : ''}.`);
        return;
      }

      const lines = orders.slice(0, 10).map((o: any, i: number) =>
        `${i + 1}. <code>${o._id}</code> — $${o.amount ?? 0} [${o.status}]`,
      );

      await ctx.reply(
        `🧾 <b>Orders${status ? ` (${status})` : ''}</b>\n\n${lines.join('\n')}\n\nTotal: ${result.pagination?.total ?? orders.length}`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to fetch orders: ${err.message}`);
    }
  }

  @On('text')
  async onMessage(@Message('text') text: string, @Ctx() ctx: Context) {
    const chatId = ctx.chat?.id;
    const botUsername = ctx.botInfo?.username;
    const msgId =
      ctx.message && 'message_id' in ctx.message
        ? ctx.message.message_id
        : undefined;

    this.logger.log(
      `[TELEGRAM] Tin nhắn nhận được | chatId=${chatId} | text(length)=${text?.length ?? 0}`,
    );

    const { title, description } =
      this.telegramService.parseMessageForAutomaker(text, botUsername);

    this.logger.log(
      `[TELEGRAM] Parse xong | title="${title}" | description(length)=${description?.length ?? 0} → gọi Automaker`,
    );

    try {
      const sentDescriptions = new Set<string>();
      const onProgress = async (content: string) => {
        if (content === TASK_RECEIVED_MSG || content.startsWith('Đã nhận được yêu cầu')) {
          await ctx.reply('✅ ' + content, {
            ...(msgId && { reply_parameters: { message_id: msgId } }),
          });
          return;
        }
        const descriptions = extractDescriptions(content);
        if (descriptions.length > 0) {
          const newOnes = descriptions.filter((d) => !sentDescriptions.has(d));
          if (newOnes.length > 0) {
            const lines = newOnes.map((d) => {
              const step = descriptions.indexOf(d) + 1;
              return `${step}. ${d}`;
            });
            const text = lines.join('\n');
            const maxLen = 4000;
            const out = text.length <= maxLen ? text : text.slice(0, maxLen) + '\n...(còn nữa)';
            await ctx.reply('📋 Cập nhật tình hình:\n\n' + out, {
              ...(msgId && { reply_parameters: { message_id: msgId } }),
            });
            newOnes.forEach((d) => sentDescriptions.add(d));
          }
          return;
        }
        if (content.length > 100 && (content.includes('Tool:') || content.includes('Input:'))) {
          if (!sentDescriptions.has('__processing__')) {
            sentDescriptions.add('__processing__');
            await ctx.reply('📋 Đang xử lý yêu cầu của bạn…', {
              ...(msgId && { reply_parameters: { message_id: msgId } }),
            });
          }
          return;
        }
        if (content.length < 500 && !content.includes('Tool:') && !content.includes('Input:')) {
          await ctx.reply('📋 ' + content.slice(0, 400), {
            ...(msgId && { reply_parameters: { message_id: msgId } }),
          });
        }
      };
      await this.telegramService.sendToAutomaker(title, description, onProgress);
      this.logger.log(`[TELEGRAM] Automaker thành công | chatId=${chatId}`);
      const reply =
        '✅ Yêu cầu của bạn đã được chỉnh sửa xong và đang deploy lên server, bạn chờ tí nhé.';
      await ctx.reply(reply, {
        ...(msgId && { reply_parameters: { message_id: msgId } }),
      });
    } catch (err: any) {
      this.logger.error(
        `[TELEGRAM] Automaker lỗi | chatId=${chatId} | error=${err?.message}`,
      );
      const reply = '❌ Lỗi: ' + (err?.message || String(err));
      await ctx.reply(reply, {
        ...(msgId && { reply_parameters: { message_id: msgId } }),
      });
    }
  }
}
