import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccessTypes } from '../accessTypes/access-types';
import { Reflector } from '@nestjs/core';
import { TokenTypeConstant } from '../../../domain/enums/token-type-constant';
import { BEARER_TOKEN_SERVICE, BearerTokenService } from '../../../contracts/bearer-token-service';
import { GenericStatusConstant } from '../../../domain/enums/generic-status-constant';

@Injectable()
export class AccessConstraintInterceptor implements NestInterceptor {

  constructor(private readonly reflector: Reflector,
              @Inject(BEARER_TOKEN_SERVICE) private readonly bearerTokenService: BearerTokenService) {
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
      const tokenPayload = await this.bearerTokenService
        .verifyBearerToken(splicedAuthorisationToken[1], TokenTypeConstant.LOGIN, GenericStatusConstant.ACTIVE);
      const portalUser = tokenPayload.portalUser;
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