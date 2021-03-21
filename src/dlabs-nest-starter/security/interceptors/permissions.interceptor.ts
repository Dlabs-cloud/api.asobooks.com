import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Connection } from 'typeorm';
import { AccessTypes } from '../accessTypes/access-types';
import { PermissionRepository } from '../../../dao/permission.repository';
import { RequestPrincipal } from '../request-principal.service';

@Injectable()
export class PermissionsInterceptor implements NestInterceptor {

  constructor(private readonly reflector: Reflector,
              private connection: Connection) {
  }


  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {

    let permissionsAccessTypes = this.reflector.getAll(AccessTypes.HAS_PERMISSION, [
      context.getHandler(), context.getClass(),
    ]);
    permissionsAccessTypes = permissionsAccessTypes.filter(permissionsAccessType => !!permissionsAccessType);

    if (permissionsAccessTypes && !permissionsAccessTypes.length) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const requestPrincipal: RequestPrincipal = request.requestPrincipal as RequestPrincipal;
    return this.connection.getCustomRepository(PermissionRepository)
      .hasPermission(requestPrincipal.portalUser, requestPrincipal.association, ...permissionsAccessTypes)
      .then(count => {
        if (!count) {
          throw new ForbiddenException('User does not have required permission');
        }
        return next.handle();
      });
  }

}
