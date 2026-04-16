import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';



@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const decoded = this.jwtService.verify(token) as unknown as Record<string, unknown>;
      const rawPayload = (decoded?.payload ?? decoded) as unknown;

      if (!rawPayload || typeof rawPayload !== 'object') {
        throw new UnauthorizedException('Invalid token payload');
      }

      const payload = rawPayload as Record<string, unknown>;
      const email = typeof payload.email === 'string' ? payload.email : undefined;
      const pickNonEmptyString = (...values: unknown[]): string | undefined => {
        for (const v of values) {
          if (typeof v !== 'string') continue;
          const s = v.trim();
          if (s) return s;
        }
        return undefined;
      };
      const uid = pickNonEmptyString(
        payload.uid,
        payload.userId,
        payload.sub,
        payload._id,
        payload.id,
        // last resort: audit logs need some stable actor identifier
        email,
      );

      request.user = {
        ...payload,
        ...(uid ? { uid } : {}),
        ...(email ? { email } : {}),
      };
      request.email = email;
    } catch {
      // Do not log here; expired tokens are a normal client condition.
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}