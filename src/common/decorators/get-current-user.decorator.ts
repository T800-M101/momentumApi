import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as any;

    if (data && user) {
      return user[data];
    }
    return user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as any;

    if (!user) return null;

    return user.sub || user.id || null;
  },
);
