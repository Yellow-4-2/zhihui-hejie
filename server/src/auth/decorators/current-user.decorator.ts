import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 直接取到 JWT 里的用户信息：@CurrentUser() user / @CurrentUser('sub') id
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return field ? request.user?.[field] : request.user;
  },
);
