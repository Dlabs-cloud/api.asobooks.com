import { EntityRepository } from 'typeorm';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';


@EntityRepository(PortalUserAccount)
export class PortalUserAccountRepository extends BaseRepository<PortalUserAccount> {

  public findByPortalAccountAndPortalUser(portalUser: PortalUser,
                                          portalAccount: PortalAccount,
                                          status: GenericStatusConstant = GenericStatusConstant.ACTIVE): Promise<PortalUserAccount> {
    return this.createQueryBuilder('membership')
      .select()
      .where('membership.portalUser=:portalUserId')
      .where('membership.portalAccount=:portalAccountId')
      .andWhere('membership.status=:status')
      .setParameter('status', status)
      .setParameter('portalUserId', portalUser.id)
      .setParameter('portalAccountId', portalAccount.id)
      .getOne();
  }

  public findByAssociationAndPortalUser(associations: Association[], portalUser: PortalUser, status = GenericStatusConstant.ACTIVE): Promise<PortalUserAccount[]> {
    let associationIds = associations.map(association => association.id);
    if (!associationIds.length) {
      return Promise.resolve([]);
    }
    return this.createQueryBuilder('membership')
      .select()
      .where('membership.association IN (:...associations)')
      .andWhere('membership.portalUser = :portalUser')
      .andWhere('membership.status=:status')
      .setParameter('status', status)
      .setParameter('associations', associationIds)
      .setParameter('portalUser', portalUser.id)
      .getMany();
  }
}