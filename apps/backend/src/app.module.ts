import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { FriendModule } from './auth/socket/friend.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';
import { CategoryProductModule } from './category-product/category-product.module';
import { ProductModule } from './product/product.module';
import { EventModule } from './event/event.module';
import { PaymentModule } from './payment/payment.module';
import { AutomakerModule } from './automaker/automaker.module';
import { TelegramModule } from './telegram/telegram.module';
import { SystemSettingsModule } from './config/system-settings.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { LeadSparkModule } from './leadspark/leadspark.module';
import { ServiceModule } from './service/service.module';
import { ServiceCategoryModule } from './service-category/service-category.module';
import { TenantModule } from './tenant/tenant.module';
import { VietQRModule } from './vietqr/vietqr.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { SeedModule } from './seed/seed.module';
import { PricingModule } from './pricing/pricing.module';
import { FaqSectionModule } from './faq-section/faq-section.module';
import { TestimonialSectionModule } from './testimonial-section/testimonial-section.module';

@Module({
  imports: [
    FriendModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [config]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('JWT_SECRET'),
      }),
      global: true,
      inject: [ConfigService],
      // secret: '123',
    }),
    AuthModule,
    MediaModule,
    UserModule,
    BlogModule,
    CategoryProductModule,
    ProductModule,
    EventModule,
    PaymentModule,
    AutomakerModule,
    TelegramModule,
    SystemSettingsModule,
    AuditLogModule,
    LeadSparkModule,
    ServiceModule,
    ServiceCategoryModule,
    TenantModule,
    VietQRModule,
    ApiKeyModule,
    PricingModule,
    FaqSectionModule,
    TestimonialSectionModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
