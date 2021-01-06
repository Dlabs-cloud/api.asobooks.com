import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException } from '@nestjs/common';
import { InActiveAccountException } from '../../exception/in-active-account.exception';
import { Response } from 'express';


@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter<ForbiddenException> {
  catch(exception: ForbiddenException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(403)
      .json({
        code: 403,
        message: exception.message,
      });
  }

}