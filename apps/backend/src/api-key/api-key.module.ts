import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { PublicIntegrationAuthGuard } from '../guards/public-integration-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    TenantModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, TenantGuard, ApiKeyGuard, PublicIntegrationAuthGuard],
  exports: [ApiKeyService, ApiKeyGuard, PublicIntegrationAuthGuard],
})
export class ApiKeyModule {}
