import {
  CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from 'src/tenant/tenant.service';
import { SKIP_TENANT_KEY } from './tenant.decorator';

/**
 * Ensures the authenticated user has a valid tenantId in their JWT payload
 * AND that the tenant actually exists and is active in the database.
 * Must be used after AuthGuard.
 * Routes decorated with @SkipTenantGuard() bypass this check.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId && !user?.email) {
      throw new ForbiddenException('No tenant associated with this account');
    }

    const resolved = await this.tenantService.resolveActiveTenantForRequest(
      user.tenantId,
      user.email,
    );
    if (!resolved) {
      throw new NotFoundException('Tenant not found');
    }
    const { tenant, effectiveTenantId } = resolved;
    // Treat missing status as 'active' to support legacy tenants created before the field existed
    if (tenant.status && tenant.status !== 'active') {
      throw new ForbiddenException('Tenant account is inactive');
    }

    request.tenantId = effectiveTenantId;
    return true;
  }
}
