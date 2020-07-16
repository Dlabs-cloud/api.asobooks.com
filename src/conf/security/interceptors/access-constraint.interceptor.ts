import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccessTypes } from '../accessTypes/access-types';
import { Reflector } from '@nestjs/core';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../../../dao/portal-user.repository';
import { GenericStatusConstant } from '../../../domain/enums/generic-status-constant';
import { PortalUser } from '../../../domain/entity/portal-user.entity';
import { TokenExpiredError } from 'jsonwebtoken';
import { Principal } from '../principal';
import { AuthenticationUtils } from '../../../common/utils/authentication-utils.service';
import { AuthenticationService } from '../../../service/authentication.service';
import { InValidTokenException } from '../../../exception/InValidTokenException';

@Injectable()
export class AccessConstraintInterceptor implements NestInterceptor {

  constructor(private readonly reflector: Reflector,
              private readonly authenticationService: AuthenticationService) {
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
    const splicedAuthorisationToken = authorisationToken.split(' ');
    if (splicedAuthorisationToken.length === 2 && splicedAuthorisationToken[0] !== 'Bearer') {
      throw new UnauthorizedException('Authorization header is not valid');
    }
    try {
      let portalUser = await this.authenticationService.verifyUserBearerToken(splicedAuthorisationToken[1]);
      delete portalUser.password;
      return next.handle();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Portal user is not authorised to login');
      }
      throw  error;
    }


  }


}