import {Injectable, Scope} from '@nestjs/common';
import {PortalUser} from '../../domain/entity/portal-user.entity';

@Injectable({
    scope: Scope.REQUEST
})
export class Principal {
   portalUser: PortalUser;
}