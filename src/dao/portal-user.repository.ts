import { Brackets, EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
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
    portalUserSelectQueryBuilder.andWhere(new Brackets((qb => {
      status.forEach((value, index) => {
        const param = {};
        param[`status${index}`] = value;
        qb.orWhere(`status=:status${index}`, param);
      });
    })));
    return portalUserSelectQueryBuilder
      .distinct()
      .getOne();
  }


  private getPortalUserNameOrEmailOrPhoneNumberSelectQueryBuilder(usernameOrEmailOrPhone: string) {
    return this
      .createQueryBuilder('portalUser')
      .select()
      .orWhere('portalUser.username = :username')
      .orWhere('portalUser.email = :username')
      .orWhere('portalUser.phoneNumber = :username')
      .setParameter('username', usernameOrEmailOrPhone);
  }
}