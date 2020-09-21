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

  public getByAssociationAndAccountType(association: Association,
                                        portalAccountType?: PortalAccountTypeConstant,
                                        status = GenericStatusConstant.ACTIVE,
                                        limit = 20,
                                        offset = 0) {
    const builder = this.createQueryBuilderGetByAssociationAndAccountType(association, portalAccountType, status, limit, offset);
    const count = builder.clone().getCount();
    const result = builder.getMany();
    return Promise.all([result, count]);
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


  public findByAssociationAndAccountType(association: Association,
                                         portalAccountType?: PortalAccountTypeConstant,
                                         status = GenericStatusConstant.ACTIVE,
                                         limit = 20,
                                         offset = 0) {
    const builder = this.createQueryBuilderGetByAssociationAndAccountType(association, portalAccountType, status, limit, offset);
    const count = builder.clone().getCount();
    const result = builder.getMany();
    return Promise.all([result, count]);
  }

  public countByAssociationAndAccountType(association: Association,
                                          portalAccountType?: PortalAccountTypeConstant,
                                          status = GenericStatusConstant.ACTIVE) {
    const builder = this.createQueryBuilderGetByAssociationAndAccountType(association, portalAccountType, status);
    return builder.getCount();
  }

  public findByAssociationAndTypeAndStatusAndCodes(association: Association, type: PortalAccountTypeConstant, status = GenericStatusConstant.ACTIVE, ...code: string[]):
    Promise<PortalUser[]> {
    return this.createQueryBuilder('portalUser')
      .select()
      .distinct()
      .innerJoin(Membership, 'membership', 'membership.portalUser=portalUser.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount=portalAccount.id')
      .where('portalUser.status = :status')
      .andWhere('portalUser.code IN (:...code)')
      .andWhere('portalAccount.association = :association')
      .andWhere('portalAccount.type = :type')
      .setParameter('status', status)
      .setParameter('association', association.id)
      .setParameter('code', code)
      .getMany();
  }


  /**
   * This is fetching all the members of an association;So it should be optimised
   * @param association
   * @param type
   * @param status
   */
  public findAllByAssociationAndTypeAndStatus(association: Association, type: PortalAccountTypeConstant, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('portalUser')
      .select()
      .distinct()
      .innerJoin(Membership, 'membership', 'membership.portalUser=portalUser.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount=portalAccount.id')
      .where('portalUser.status = :status')
      .andWhere('portalAccount.association = :association')
      .andWhere('portalAccount.type = :type')
      .setParameter('status', status)
      .setParameter('association', association.id)
      .setParameter('type', type)
      .getMany();
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


  private createQueryBuilderGetByAssociationAndAccountType(association: Association,
                                                           portalAccountType?: PortalAccountTypeConstant,
                                                           status = GenericStatusConstant.ACTIVE,
                                                           limit = 20,
                                                           offset = 0) {
    const builder = this
      .createQueryBuilder('portalUser')
      .select()
      .distinct()
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
    return builder;
  }


}