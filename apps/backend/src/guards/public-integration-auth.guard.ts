import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiKeyService } from 'src/api-key/api-key.service';

/**
 * For marketing-site integrations: accept either `Authorization: Bearer <JWT>`
 * (dashboard user) or `x-api-key` (tenant API key). {@link TenantGuard} runs after.
 */
@Injectable()
export class PublicIntegrationAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (!token) {
        throw new UnauthorizedException('Missing bearer token');
      }
      try {
        const decoded = this.jwtService.verify(token) as { payload?: Record<string, unknown> };
        const payload = decoded.payload;
        if (!payload || typeof payload !== 'object') {
          throw new UnauthorizedException('Invalid token payload');
        }
        request.user = payload;
        request.email = (payload as { email?: string }).email;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    const key = request.headers['x-api-key'];
    if (!key || typeof key !== 'string') {
      throw new UnauthorizedException('Provide Authorization: Bearer <token> or x-api-key header');
    }

    const apiKey = await this.apiKeyService.validateKey(key);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    request.user = { tenantId: apiKey.tenantId.toString() };
    return true;
  }
}
