import { ConflictException, Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountSequence } from '../core/sequenceGenerators/portal-account.sequence';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@Injectable()
export class PortalAccountService {

  constructor(private readonly connection: Connection,
              private readonly portalAccountSequenceGenerator: PortalAccountSequence) {
  }

  public async createPortalAccount(entityManager: EntityManager, portalAccount: PortalAccount): Promise<PortalAccount> {
    portalAccount.accountCode = await this.portalAccountSequenceGenerator.next();
    portalAccount.status = GenericStatusConstant.ACTIVE;
    await entityManager.save(portalAccount);
    return portalAccount;
  }

  public async activatePortalAccount(entityManager: EntityManager, portalAccount: PortalAccount) {
    portalAccount.status = GenericStatusConstant.ACTIVE;
    portalAccount.updatedAt = new Date();
    await entityManager.save(portalAccount);
    return portalAccount;
  }

}