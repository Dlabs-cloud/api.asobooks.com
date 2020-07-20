import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import { Some } from 'optional-typescript';

export const RequestPrincipalContext = createParamDecorator((data, req) => {
  const principal = Some(req.requestPrincipal).valueOrUndefined();
  if (!principal) {
    throw new UnauthorizedException('A request principal is needed for this route!');
  }

  return req.requestPrincipal;
});
