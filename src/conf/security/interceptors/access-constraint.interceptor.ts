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

@Injectable()
export class AccessConstraintInterceptor implements NestInterceptor {

  constructor(private readonly reflector: Reflector,
              private readonly principal: Principal,
              private readonly authenticationUtils: AuthenticationUtils,
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
    const splicedAuthorisationToken = authorisationToken.split(' ');
    if (splicedAuthorisationToken.length === 2 && splicedAuthorisationToken[0] !== 'Bearer') {
      throw new UnauthorizedException('Authorization header is not valid');
    }
    await this.authenticationUtils
      .verifyBearerToken(authorisationToken[1])
      .then((decoded: { sub: string }) => {
        return this.connection.getCustomRepository(PortalUserRepository).findOneItem({
          id: Number(decoded.sub),
          status: GenericStatusConstant.ACTIVE,
        });
      }).then((portalUser: PortalUser) => {
        if (!portalUser) {
          throw new UnauthorizedException('User is not active');
        }
        delete portalUser.password;
        this.principal.portalUser = portalUser;
        return Promise.resolve();
      }).catch((error) => {
        if (error instanceof TokenExpiredError) {
          const tokenError = error as TokenExpiredError;
          throw new UnauthorizedException(tokenError.message);
        }
        if (error instanceof UnauthorizedException) {
          throw new UnauthorizedException('Portal user is not authorised to login');
        }

        throw  error;
      });

    return next.handle();
  }

}