import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { FriendModule } from './auth/socket/friend.module';
import { MinioModule } from './minio/minio.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';
import { CategoryProductModule } from './category-product/category-product.module';
import { ProductModule } from './product/product.module';
import { EventModule } from './event/event.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    FriendModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [config]
    }),
    MongooseModule.forRoot('mongodb://admin:admin123@72.61.125.140:27017/core-web-cms?authSource=admin'),
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
    MinioModule,
    UserModule,
    BlogModule,
    CategoryProductModule,
    ProductModule,
    EventModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
