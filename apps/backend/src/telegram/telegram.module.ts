import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AutomakerModule } from '../automaker/automaker.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from '../payment/payment.module';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

/** Valid-shaped placeholder so Telegraf can be constructed when no token is set (no network calls if launch is disabled). */
const TELEGRAM_DISABLED_PLACEHOLDER_TOKEN =
  '000000000:AA00000000000000000000000000000000';

@Module({
  imports: [
    AutomakerModule,
    UserModule,
    ProductModule,
    forwardRef(() => PaymentModule),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const token = (configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '').trim();
        const skipLaunch =
          configService.get<string>('TELEGRAM_SKIP_LAUNCH') === 'true' ||
          configService.get<string>('TELEGRAM_SKIP_LAUNCH') === '1';

        // bot.launch() always calls getMe(); skip when offline / no token to avoid ETIMEDOUT crashing the process.
        const launchOptions =
          !token || skipLaunch
            ? false
            : configService.get<string>('TELEGRAM_WEBHOOK_URL')
              ? undefined
              : { dropPendingUpdates: true };

        return {
          token: token || TELEGRAM_DISABLED_PLACEHOLDER_TOKEN,
          launchOptions,
          include: [TelegramModule],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramService, TelegramUpdate],
  exports: [TelegramService],
})
export class TelegramModule {}
