import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { PublicIntegrationAuthGuard } from 'src/guards/public-integration-auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { TenantService } from './tenant.service';

export type TenantLocaleSettingsResponse = {
  defaultLocale: string;
  supportedLocales: string[];
};

/**
 * Read-only tenant locale policy for integrations (marketing site, etc.).
 * Authenticate with `Authorization: Bearer <JWT>` or `x-api-key` (Dashboard → API keys).
 * Aligns with {@link Tenant.defaultLocale} / {@link Tenant.supportedLocales} in Mongo.
 */
@UseGuards(PublicIntegrationAuthGuard, TenantGuard)
@Controller('public/tenant')
export class TenantPublicController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('locale')
  async getLocaleSettings(@CurrentTenant() tenantId: string): Promise<TenantLocaleSettingsResponse> {
    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const supported =
      Array.isArray(tenant.supportedLocales) && tenant.supportedLocales.length > 0
        ? tenant.supportedLocales
        : ['en'];
    const defaultLocale = tenant.defaultLocale?.trim() || supported[0] || 'en';
    return {
      defaultLocale,
      supportedLocales: supported,
    };
  }
}
