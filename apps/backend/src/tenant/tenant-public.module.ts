import { Module } from '@nestjs/common';
import { TenantModule } from './tenant.module';
import { TenantPublicController } from './tenant-public.controller';
import { ApiKeyModule } from '../api-key/api-key.module';
import { TenantGuard } from '../guards/tenant.guard';

/**
 * Public, API-key–scoped tenant metadata for external sites (avoids importing ApiKeyModule into TenantModule).
 */
@Module({
  imports: [TenantModule, ApiKeyModule],
  controllers: [TenantPublicController],
  providers: [TenantGuard],
})
export class TenantPublicModule {}
