import { ArgumentsHost, Catch, ExceptionFilter, ServiceUnavailableException } from '@nestjs/common';
import { Response } from 'express';

@Catch(ServiceUnavailableException)
export class ServiceUnavailableExceptionFilter implements ExceptionFilter<ServiceUnavailableException> {

  catch(exception: ServiceUnavailableException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(503)
      .json({
        code: 503,
        message: exception.message.message,
      });
  }
}