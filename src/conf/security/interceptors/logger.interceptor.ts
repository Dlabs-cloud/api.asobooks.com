import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Connection } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RequestLogEntity } from '../../../domain/entity/request-log.entity';
import { map, tap } from 'rxjs/operators';
import { AccessTypes } from '../accessTypes/access-types';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly connection: Connection) {
  }

  // @ts-ignore
  async intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    let annotations = this.reflector.getAllAndMerge(AccessTypes.LOG, [
      context.getClass(), context.getHandler(),
    ]);

    // tslint:disable-next-line:no-console
    // tslint:disable-next-line:no-console
    annotations = annotations.filter(column => column);

    // tslint:disable-next-line:no-console


    if (annotations.includes(AccessTypes.LOG)) {
      const request = context.switchToHttp().getRequest<Request>();
      const requestLog = new RequestLogEntity();
      requestLog.requestData = JSON.stringify(request.body);
      requestLog.requestUrl = request.url;
      requestLog.ip = request.ip;
      requestLog.requestType = request.method;

      await this.connection.transaction(async (entityManager) => {
        await entityManager.save(requestLog);
      });
      return next.handle().pipe(map(async data => {
        // tslint:disable-next-line:no-console
        await this.connection.transaction(async (entityManager) => {
          requestLog.responseData = JSON.stringify(data);
          await entityManager.save(requestLog);
        });
        return data;
      }));
    }

    return next.handle();

  }
}
