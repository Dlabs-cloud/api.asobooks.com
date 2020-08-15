import { Brackets, EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Membership } from '../domain/entity/membership.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Some } from 'optional-typescript';

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

  public getByAssociationAndAccountType(association: Association,
                                        portalAccountType?: PortalAccountTypeConstant,
                                        status = GenericStatusConstant.ACTIVE,
                                        limit = 20,
                                        offset = 0) {
    let builder = this
      .createQueryBuilder('portalUser')
      .select()
      .innerJoin(Membership, 'membership', 'membership.portalUser = portalUser.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('portalUser.status = :status')
      .andWhere('portalAccount.association = :association')
      .limit(limit)
      .take(offset)
      .setParameter('status', status)
      .setParameter('association', association.id);

    Some(portalAccountType).ifPresent(type => {
      builder
        .andWhere('portalAccount.type = :portalAccountType')
        .setParameter('portalAccountType', portalAccountType);
    });
    return builder.getManyAndCount();

  }
}