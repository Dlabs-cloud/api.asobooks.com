import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Connection } from 'typeorm';
import { AccessTypes } from '../accessTypes/access-types';
import { Reflector } from '@nestjs/core';
import { AssociationRepository } from '../../../dao/association.repository';
import { RequestPrincipal } from '../request-principal.service';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class AssociationConstraintInterceptor implements NestInterceptor {

  constructor(private readonly connection: Connection, private readonly reflector: Reflector) {
  }

  // @ts-ignore
  async intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const associationAccessTypes = this.reflector.getAll(AccessTypes.ASSOCIATION, [
      context.getHandler(), context.getClass(),
    ]);
    if (!associationAccessTypes.includes(AccessTypes.ASSOCIATION)) {
      return next.handle();
    }
    let request = context.switchToHttp().getRequest();
    const associationCode = request.header('X-ASSOCIATION-IDENTIFIER');
    if (associationAccessTypes.includes(AccessTypes.ASSOCIATION) && !isNotEmpty(associationCode)) {
      throw new UnauthorizedException('Association code provided in header is not valid');
    }

    const principal: RequestPrincipal = request.requestPrincipal;


    let association = await this.connection.getCustomRepository(AssociationRepository).findByPortalUserAndCodeAndStatus(principal.portalUser, associationCode);
    if (!association) {
      throw new ForbiddenException('Association code provided in header is not valid');
    }
    principal.association = association;
    request.requestPrincipal = principal;

    return next.handle();
  }

}
