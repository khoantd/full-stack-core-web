import { Controller, Post, UseGuards } from '@nestjs/common';
import { LeadSparkService } from './leadspark.service';
import { AuthGuard } from '../guards/auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { CurrentTenant } from '../guards/tenant.decorator';

@Controller('leadspark')
@UseGuards(AuthGuard, TenantGuard)
export class LeadSparkController {
  constructor(private readonly leadSparkService: LeadSparkService) {}

  @Post('sync')
  syncProducts(@CurrentTenant() tenantId: string) {
    return this.leadSparkService.syncAllProducts(tenantId);
  }
}
