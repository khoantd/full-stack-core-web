import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from 'src/api-key/api-key.service';

/**
 * Guard for external system access via API key.
 * Reads the key from the `x-api-key` header and validates it.
 * On success, attaches `{ tenantId }` to request.user.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];

    if (!key || typeof key !== 'string') {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const apiKey = await this.apiKeyService.validateKey(key);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    request.user = { tenantId: apiKey.tenantId.toString() };
    return true;
  }
}
