import { createParamDecorator, UnauthorizedException } from '@nestjs/common';


export const RequestPrincipalContext = createParamDecorator((data, req) => {
  if (!req.requestPrincipal) {
    throw new UnauthorizedException('A request principal is needed for this route!');
  }
  return req.requestPrincipal;
});
