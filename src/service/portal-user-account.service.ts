import { Injectable } from '@nestjs/common';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EntityManager } from 'typeorm';

@Injectable()
export class PortalUserAccountService {

  public activateMembership(entityManager: EntityManager, portalUserAccount: PortalUserAccount) {
    portalUserAccount.status = GenericStatusConstant.ACTIVE;
    portalUserAccount.updatedAt = new Date();
    return entityManager.save(portalUserAccount);
  }
}