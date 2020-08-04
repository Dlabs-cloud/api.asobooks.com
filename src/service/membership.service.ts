import { Injectable } from '@nestjs/common';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EntityManager } from 'typeorm';

@Injectable()
export class MembershipService {

  public activateMembership(entityManager: EntityManager, membership: Membership) {
    membership.status = GenericStatusConstant.ACTIVE;
    membership.updatedAt = new Date();
    return entityManager.save(membership);
  }
}