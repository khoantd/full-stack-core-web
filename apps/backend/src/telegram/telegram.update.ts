import { Injectable, Logger } from '@nestjs/common';
import { Update, Ctx, Message, On, Start } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

const TASK_RECEIVED_MSG = 'Đã nhận được yêu cầu và đang tiến hành xử lý.';

/** Trích chỉ các value của field "description" từ content (agent-output). */
function extractDescriptions(content: string): string[] {
  const list: string[] = [];
  const add = (val: string) => {
    const n = val.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (n && !list.includes(n)) list.push(n);
  };
  // "description": "value" (double quote)
  let m: RegExpExecArray | null;
  const re1 = /"description"\s*:\s*"((?:[^"\\]|\\.)*)"/gi;
  while ((m = re1.exec(content)) !== null) add(m[1]);
  // 'description': 'value'
  const re2 = /'description'\s*:\s*'((?:[^'\\]|\\.)*)'/gi;
  while ((m = re2.exec(content)) !== null) add(m[1]);
  // description: "value" (key không dấu ngoặc)
  const re3 = /\bdescription\s*:\s*"((?:[^"\\]|\\.)*)"/gi;
  while ((m = re3.exec(content)) !== null) add(m[1]);
  // 🔧 Tool: ... \n Input: { "description": "value" } (block trên một dòng)
  const re4 = /Input:\s*\{\s*[^}]*?"description"\s*:\s*"((?:[^"\\]|\\.)*)"/gi;
  while ((m = re4.exec(content)) !== null) add(m[1]);
  return list;
}
//aaaa
@Update()
@Injectable()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.logger.log(`[TELEGRAM] /start | chatId=${ctx.chat?.id}`);
    await ctx.reply(
      'Chào bạn! Gửi nội dung để tạo feature (title: Chỉnh sửa hệ thống, description: toàn bộ tin nhắn của bạn).\n\nVí dụ: Đổi màu banner section hero ở trang home sang màu vàng.',
    );
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
        // Thông báo ngay sau khi tạo task
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
        // Có content dài (log Tool) nhưng không trích được description → gửi 1 dòng đang xử lý (chỉ 1 lần)
        if (content.length > 100 && (content.includes('Tool:') || content.includes('Input:'))) {
          if (!sentDescriptions.has('__processing__')) {
            sentDescriptions.add('__processing__');
            await ctx.reply('📋 Đang xử lý yêu cầu của bạn…', {
              ...(msgId && { reply_parameters: { message_id: msgId } }),
            });
          }
          return;
        }
        // Fallback: content ngắn (không phải log Tool) thì gửi nguyên
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
