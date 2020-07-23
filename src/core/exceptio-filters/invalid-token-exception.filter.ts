import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { IllegalArgumentException } from '../../exception/illegal-argument.exception';
import { InvalidtokenException } from '../../exception/invalidtoken.exception';
import { Response } from 'express';

@Catch(InvalidtokenException)
export class InvalidTokenExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidtokenException, host: ArgumentsHost): any {
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