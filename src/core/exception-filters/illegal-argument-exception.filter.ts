import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { IllegalArgumentException } from '../../exception/illegal-argument.exception';


@Catch(IllegalArgumentException)
export class IllegalArgumentExceptionFilter implements ExceptionFilter {

  catch(exception: IllegalArgumentException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(400)
      .json({
        code: 400,
        message: exception.message,
      });
  }

}