import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ServiceUnavailableException } from '../../exception/ServiceUnavailableException';

@Catch(ServiceUnavailableException)
export class ServiceUnavailableExceptionFilter implements ExceptionFilter<ServiceUnavailableException> {

  catch(exception: UnauthorizedException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(503)
      .json({
        code: 503,
        message: exception.message,
      });
  }
}