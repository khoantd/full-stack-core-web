import 'reflect-metadata';
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first'); // Ép toàn bộ app dùng IPv4 trước
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Cho phép tất cả các domain
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false, // Tắt cookie nếu không cần
  });

  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
