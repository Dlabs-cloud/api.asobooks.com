import { EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';

@EntityRepository(PortalAccount)
export class PortalAccountRepository extends BaseRepository<PortalAccount> {

  async findFirstByPortalUserAndStatus(portalUser: PortalUser,
                                       throwIfMany: boolean = false,
                                       status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    const portalAccountSelectQueryBuilder = this.createQueryBuilder('portalAccount')
      .select()
      .innerJoin(PortalUserAccount, 'membership', 'membership.portalAccount=portalAccount.id')
      .innerJoin(PortalUser, 'portalUser', 'membership.portalUser=portalUser.id')
      .where('portalUser.id=:portalUserId')
      .andWhere('portalAccount.status=:status')
      .setParameter('portalUserId', portalUser.id)
      .setParameter('status', status)
      .addOrderBy('portalAccount.createdAt', 'ASC');

    const count = await portalAccountSelectQueryBuilder.clone().getCount();
    if (throwIfMany && count > 1) {
      throw new IllegalArgumentException('user has more than one account');
    }
    return portalAccountSelectQueryBuilder.getOne();
  }
}