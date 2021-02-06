import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountSequence } from '../core/sequenceGenerators/portal-account.sequence';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { PortalAccountDto } from '../dto/portal-account.dto';
import { Association } from '../domain/entity/association.entity';

@Injectable()
export class PortalAccountService {

  constructor(private readonly connection: Connection,
              private readonly portalAccountSequenceGenerator: PortalAccountSequence) {
  }

  public async createPortalAccount(entityManager: EntityManager, portalAccountDto: PortalAccountDto, status = GenericStatusConstant.ACTIVE): Promise<PortalAccount> {
    return this.portalAccountSequenceGenerator.next().then(sequenceCode => {
      let portalAccount = new PortalAccount();
      portalAccount.name = portalAccountDto.name;
      portalAccount.type = portalAccountDto.type;
      portalAccount.code = sequenceCode;
      portalAccount.association = portalAccountDto.association;
      portalAccount.status = status;
      return entityManager.save(portalAccount);
    });

  }

  public async activatePortalAccount(entityManager: EntityManager, portalAccount: PortalAccount) {
    portalAccount.status = GenericStatusConstant.ACTIVE;
    portalAccount.updatedAt = new Date();
    await entityManager.save(portalAccount);
    return portalAccount;
  }


}