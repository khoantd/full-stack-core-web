import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  _id?: string;
  id?: string;
  uid?: string;
  email?: string;
  tenantId?: string;
  role?: unknown;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as RequestUser | undefined;
  },
);

