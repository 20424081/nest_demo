import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUrl = createParamDecorator(
  (data, ctx: ExecutionContext): any => {
    const req = ctx.switchToHttp().getRequest();
    return `${req.protocol}://${req.get('host')}`;
  },
);
