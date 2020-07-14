import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccessTypes } from '../accessTypes/access-types';
import { Reflector } from '@nestjs/core';
import { Connection } from 'typeorm';
import { Principal } from '../principal';
import { AuthenticationService } from '../../../service/authentication.service';

@Injectable()
export class AccessConstraintInterceptor implements NestInterceptor {

  constructor(private readonly reflector: Reflector,
              private readonly principal: Principal,
              private readonly authenticationService: AuthenticationService,
              private readonly  connection: Connection) {
  }

  // @ts-ignore
  async intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const publicAccessType = this.reflector.getAll(AccessTypes.PUBLIC, [
      context.getHandler(), context.getClass(),
    ]);

    if (publicAccessType.includes(AccessTypes.PUBLIC)) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const authorisationToken = request.header('Authorization');

    if (!authorisationToken) {
      throw new UnauthorizedException('Authorization header is not valid');
    }
    try {
      this.principal.portalUser = await this.authenticationService.verifyUserBearerToken(authorisationToken);
      return next.handle();
    } catch (ex) {
      throw new UnauthorizedException(ex.message);
    }

  }

}