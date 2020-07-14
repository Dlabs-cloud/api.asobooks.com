import { EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(PortalUser)
export class PortalUserRepository extends BaseRepository<PortalUser> {


  public findFirstByPortalAccount(portalAccount: PortalAccount, status: GenericStatusConstant = GenericStatusConstant.ACTIVE): Promise<PortalUser> {
    return this.createQueryBuilder('portalUser')
      .select()
      .innerJoin(Membership, 'membership', 'membership.portalUser=portalUser.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount=portalAccount.id')
      .where('portalAccount.id=:portalAccountId')
      .andWhere('portalAccount.status=:status')
      .andWhere('portalUser.status=:status')
      .andWhere('membership.status=:status')
      .addOrderBy('portalUser.createdAt', 'ASC')
      .setParameter('portalAccountId', portalAccount.id)
      .setParameter('status', status)
      .getOne();
  }

  public findByUserNameOrEmailOrPhoneNumber(usernameOrEmailOrPhone: string) {
    return this
      .createQueryBuilder('portalUser')
      .select()
      .orWhere('portalUser.username = :username')
      .orWhere('portalUser.email = :username')
      .orWhere('portalUser.phoneNumber = :username')
      .where('portalUser.status = :status')
      .setParameter('status', GenericStatusConstant.ACTIVE)
      .setParameter('username', usernameOrEmailOrPhone)
      .distinct()
      .getOne();
  }
}