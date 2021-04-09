import { CallHandler, ExecutionContext, HttpException, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';
import { Scope } from '@sentry/hub';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Handlers } from '@sentry/node';
import { ParseRequestOptions } from '@sentry/node/dist/handlers';
import { Log } from '../../conf/logger/Logger';

export class RemoteLoggerInterceptor implements NestInterceptor {

  constructor(private readonly logger: Log, private readonly options?: ParseRequestOptions) {
    // logger.setContext('RemoteLoggerInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      tap({
        error: (exception: any) => {
          if (this.shouldReport(exception)) {
            this.logger.error('Line (22) server error', exception);
            console.log(exception);
            Sentry.withScope((scope => {
              this.addHttpExceptionMetadatas(scope, context.switchToHttp());
              Sentry.captureException(exception);
              Sentry.setExtras({
                'client': 'Mac Book',
              });
            }));
          }
        },
      }),
    );
  }

  private shouldReport(exception: HttpException): boolean {
    return exception.getStatus() >= 500;
  }

  private addHttpExceptionMetadatas(
    scope: Scope,
    http: HttpArgumentsHost,
  ): void {
    const data = Handlers.parseRequest(
      <any>{},
      http.getRequest(),
      this.options,
    );

    scope.setExtra('req', data.request);
    data.extra && scope.setExtras(data.extra);
  }

}
