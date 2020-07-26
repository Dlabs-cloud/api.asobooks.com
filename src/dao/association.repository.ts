import { BaseRepository } from '../common/BaseRepository';
import { Association } from '../domain/entity/association.entity';
import { EntityRepository } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';

@EntityRepository(Association)
export class AssociationRepository extends BaseRepository<Association> {

  findByPortalAccount(portalAccount: PortalAccount) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalUserAccount, 'portalUserAccount', 'portalUserAccount.association=association.id')
      .andWhere('association.status = :status')
      .andWhere('portalUserAccount.status=:status')
      .andWhere('portalUserAccount.portalAccount=:portalAccountId')
      .setParameter('portalAccountId', portalAccount.id)
      .getOne();
  }


  findByPortalUserAccount(portalUserAccount: PortalUserAccount, status: GenericStatusConstant = GenericStatusConstant.PENDING_ACTIVATION) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalUserAccount, 'portalUserAccount', 'portalUserAccount.association=association.id')
      .andWhere('association.status = :status')
      .andWhere('portalUserAccount.id=:portalAccountId')
      .setParameter('status', status)
      .setParameter('portalAccountId', portalUserAccount.id)
      .getOne();
  }


}