import { EntityRepository } from 'typeorm';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';


@EntityRepository(PortalUserAccount)
export class MembershipRepository extends BaseRepository<PortalUserAccount> {

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
}