import { EntityRepository } from 'typeorm';
import { Membership } from '../domain/entity/membership.entity';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';


@EntityRepository(Membership)
export class MembershipRepository extends BaseRepository<Membership> {

  public findByPortalAccountAndPortalUser(portalUser: PortalUser,
                                          portalAccount: PortalAccount,
                                          status = GenericStatusConstant.ACTIVE): Promise<Membership> {
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

  public findByAssociationAndAccountTypeAndStatusAndUserIds(association: Association,
                                                            accountType: PortalAccountTypeConstant,
                                                            status = GenericStatusConstant.ACTIVE,
                                                            ...users: number[]) {

    return this.createQueryBuilder('membership')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('portalAccount.association = :association')
      .andWhere('portalAccount.type = :type')
      .andWhere('membership.status = :status')
      .andWhere('membership.portalUser IN (:...users) ')
      .setParameter('association', association.id)
      .setParameter('type', accountType)
      .setParameter('status', status)
      .setParameter('users', users)
      .getMany();
  }


}