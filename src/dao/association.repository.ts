import { BaseRepository } from '../common/BaseRepository';
import { Association } from '../domain/entity/association.entity';
import { EntityRepository } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Association)
export class AssociationRepository extends BaseRepository<Association> {

  findByPortalAccount(portalAccount: PortalAccount, status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.id=association.portalAccount')
      .where('portalAccount.id = :portalAccountId')
      .andWhere('association.status = :status')
      .setParameter('portalAccountId', portalAccount.id)
      .setParameter('status', status)
      .getOne();
  }
}