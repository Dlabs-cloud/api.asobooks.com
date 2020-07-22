import { Injectable } from '@nestjs/common';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EntityManager } from 'typeorm';

@Injectable()
export class MembershipService {

  public activateMembership(entityManager: EntityManager, membership: PortalUserAccount) {
    membership.status = GenericStatusConstant.ACTIVE;
    membership.updatedAt = new Date();
    return entityManager.save(membership);


  }
}