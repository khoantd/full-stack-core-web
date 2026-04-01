import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    TenantModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, TenantGuard],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
