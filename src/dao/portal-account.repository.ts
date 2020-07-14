import { EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';

@EntityRepository(PortalAccount)
export class PortalAccountRepository extends BaseRepository<PortalAccount> {

  async findFirstByPortalUserAndStatus(portalUser: PortalUser, status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('portalAccount')
      .select()
      .innerJoin(Membership, 'membership', 'membership.portalAccount=portalAccount.id')
      .innerJoin(PortalUser, 'portalUser', 'membership.portalUser=portalUser.id')
      .where('portalUser.id=:portalUserId')
      .andWhere('portalAccount.status=:status')
      .setParameter('portalUserId', portalUser.id)
      .setParameter('status', status)
      .addOrderBy('portalAccount.createdAt', 'ASC')
      .getOne();
  }
}