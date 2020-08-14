import { Brackets, EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(PortalUser)
export class PortalUserRepository extends BaseRepository<PortalUser> {


  public findByUserNameOrEmailOrPhoneNumberAndNotDeleted(usernameOrEmailOrPhone: string) {
    return this.getPortalUserNameOrEmailOrPhoneNumberSelectQueryBuilder(usernameOrEmailOrPhone)
      .andWhere('status != :status', { 'status': GenericStatusConstant.DELETED })
      .getOne();
  }

  public findByUserNameOrEmailOrPhoneNumberAndStatus(usernameOrEmailOrPhone: string, ...status: GenericStatusConstant[]) {
    const portalUserSelectQueryBuilder = this.getPortalUserNameOrEmailOrPhoneNumberSelectQueryBuilder(usernameOrEmailOrPhone);
    let one = portalUserSelectQueryBuilder
      .andWhere('portalUser.status IN (:...status)')
      .setParameter('status', status)
      .distinct()
      .getOne();
    return one;
  }


  private getPortalUserNameOrEmailOrPhoneNumberSelectQueryBuilder(usernameOrEmailOrPhone: string) {
    return this
      .createQueryBuilder('portalUser')
      .select()
      .where(new Brackets(qb => {
        qb.orWhere('portalUser.username = :username')
          .orWhere('portalUser.email = :username')
          .orWhere('portalUser.phoneNumber = :username');
      }))
      .setParameter('username', usernameOrEmailOrPhone);
  }
}