import { Brackets, EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(PortalUser)
export class PortalUserRepository extends BaseRepository<PortalUser> {



  public findByUserNameOrEmailOrPhoneNumberAndStatus(usernameOrEmailOrPhone: string, ...status: GenericStatusConstant[]) {
    const portalUserSelectQueryBuilder = this
      .createQueryBuilder('portalUser')
      .select()
      .orWhere('portalUser.username = :username')
      .orWhere('portalUser.email = :username')
      .orWhere('portalUser.phoneNumber = :username');
    portalUserSelectQueryBuilder.andWhere(new Brackets((qb => {
      status.forEach((value, index) => {
        const param = {};
        param[`status${index}`] = value;
        qb.orWhere(`status=:status${index}`, param);
      });
    })));
    return portalUserSelectQueryBuilder
      .setParameter('username', usernameOrEmailOrPhone)
      .distinct()
      .getOne();
  }


}