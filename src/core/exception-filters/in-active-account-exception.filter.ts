import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { InActiveAccountException } from '../../exception/in-active-account.exception';

@Catch(InActiveAccountException)
export class InActiveAccountExceptionFilter implements ExceptionFilter<InActiveAccountException> {

  catch(exception: InActiveAccountException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(406)
      .json({
        code: 406,
        message: exception.message,
      });
  }
}