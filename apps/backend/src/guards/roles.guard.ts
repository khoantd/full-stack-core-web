import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are specified, access is granted
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('Bạn không có quyền truy cập !');
    }

    // user.role may be a plain string (from JWT) or a populated object { name: string }
    const roleName: string =
      typeof user.role === 'object' && user.role !== null
        ? (user.role as { name?: string }).name ?? ''
        : String(user.role);

    if (!requiredRoles.includes(roleName)) {
      throw new ForbiddenException('Bạn không có quyền truy cập !');
    }
    
    return true;
  }
}
