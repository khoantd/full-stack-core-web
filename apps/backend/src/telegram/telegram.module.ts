import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AutomakerModule } from '../automaker/automaker.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from '../payment/payment.module';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    AutomakerModule,
    UserModule,
    ProductModule,
    forwardRef(() => PaymentModule),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token:
          configService.get<string>('TELEGRAM_BOT_TOKEN') ||
          '8602829705:AAHemfHptO9ivMlXYNVfxm4U5tO7CJeMp4A',
        launchOptions: configService.get<string>('TELEGRAM_WEBHOOK_URL')
          ? undefined
          : { dropPendingUpdates: true },
        include: [TelegramModule],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramService, TelegramUpdate],
  exports: [TelegramService],
})
export class TelegramModule {}
