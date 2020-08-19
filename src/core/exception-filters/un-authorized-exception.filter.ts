import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { UnAuthorizedException } from '../../exception/unAuthorized.exception';

@Catch(UnAuthorizedException)
export class UnAuthorizedExceptionFilter implements ExceptionFilter<UnAuthorizedException> {

  catch(exception: UnauthorizedException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(401)
      .json({
        code: 401,
        message: exception.message,
      });
  }
}