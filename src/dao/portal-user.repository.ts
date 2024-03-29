import { Brackets, EntityRepository } from 'typeorm';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { Membership } from '../domain/entity/membership.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';
import { Group } from '../domain/entity/group.entity';

@EntityRepository(PortalUser)
export class PortalUserRepository extends BaseRepository<PortalUser> {


  public findByUserNameOrEmailOrPhoneNumberAndNotDeleted(usernameOrEmailOrPhone: string) {
    return this.getPortalUserNameOrEmailOrPhoneNumberSelectQueryBuilder(usernameOrEmailOrPhone)
      .andWhere('status != :status', { 'status': GenericStatusConstant.DELETED })
      .getOne();
  }

  public findByUserNameOrEmailOrPhoneNumberAndStatus(usernameOrEmailOrPhone: string, ...status: GenericStatusConstant[]) {
    const portalUserSelectQueryBuilder = this.getPortalUserNameOrEmailOrPhoneNumberSelectQueryBuilder(usernameOrEmailOrPhone);
    return portalUserSelectQueryBuilder
      .andWhere('portalUser.status IN (:...status)')
      .setParameter('status', status)
      .distinct()
      .getOne();
  }

  public findByMemberships(memberships: Membership[]) {
    const membershipIds = memberships.map(membership => membership.id);
    return this.createQueryBuilder('portalUser')
      .select()
      .innerJoin(Membership, 'membership', 'membership.portalUser = portalUser.id')
      .where('membership.id IN (:...membership)')
      .setParameter('membership', membershipIds)
      .getMany();
  }


  public findByServiceFeeAndStatus(serviceFee: ServiceFee, limit = 10, offset = 0, status = GenericStatusConstant.ACTIVE) {
    return this.findByServiceFeeAndStatusQueryBuilder(serviceFee, status, limit, offset)
      .getManyAndCount();
  }


  public countByServiceFeeAndStatus(serviceFee: ServiceFee, limit = 10, offset = 0, status = GenericStatusConstant.ACTIVE) {
    return this.findByServiceFeeAndStatusQueryBuilder(serviceFee, status, limit, offset)
      .getCount();
  }


  private findByServiceFeeAndStatusQueryBuilder(serviceFee: ServiceFee, status: GenericStatusConstant, limit: number, offset: number) {
    return this.createQueryBuilder('portalUser')
      .innerJoin(Membership, 'membership', 'membership.portalUser = portalUser.id')
      .innerJoin(GroupMembership, 'membershipGroup', 'membershipGroup.membership = membership.id')
      .innerJoin(Group, 'group', 'membershipGroup.group = group.id')
      .innerJoin(GroupServiceFee, 'groupServiceFee', 'groupServiceFee.group = group.id')
      .where('groupServiceFee.serviceFee = :service', { service: serviceFee.id })
      .andWhere('portalUser.status = :status', { status })
      .andWhere('group.status = :status', { status })
      .andWhere('groupServiceFee.status = :status', { status })
      .andWhere('membershipGroup.status = :status', { status })
      .limit(limit)
      .offset(offset);
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


  public findByMembershipId(membership: number) {
    return this.createQueryBuilder('portalUser')
      .innerJoin(Membership, 'membership', 'membership.portalUser = portalUser.id')
      .where('membership.id = :membership')
      .setParameter('membership', membership)
      .getOne();
  }


  findByAssociationAndId(association: Association, id: number, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('portalUser')
      .innerJoin(Membership, 'membership', 'membership.portalUser = portalUser.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('portalAccount.association = :associationId', { associationId: association.id })
      .andWhere('portalUser.status = :status', { status })
      .andWhere('portalUser.id =:id', { id })
      .getOne();
  }


}