import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler<ApiResponseDto<T>>): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(tap(responseVal => {
      response.status(responseVal.code ?? 200);
    }));
  }

}