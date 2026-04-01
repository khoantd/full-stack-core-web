import {
  CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { TenantService } from 'src/tenant/tenant.service';

/**
 * Ensures the authenticated user has a valid tenantId in their JWT payload
 * AND that the tenant actually exists and is active in the database.
 * Must be used after AuthGuard.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId) {
      throw new ForbiddenException('No tenant associated with this account');
    }

    let tenant: any;
    try {
      tenant = await this.tenantService.findById(user.tenantId);
    } catch {
      throw new NotFoundException('Tenant not found');
    }
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    // Treat missing status as 'active' to support legacy tenants created before the field existed
    if (tenant.status && tenant.status !== 'active') {
      throw new ForbiddenException('Tenant account is inactive');
    }

    request.tenantId = user.tenantId;
    return true;
  }
}
