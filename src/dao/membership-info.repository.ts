import { BaseRepository } from '../common/BaseRepository';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { EntityRepository } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';

@EntityRepository(MembershipInfo)
export class MembershipInfoRepository extends BaseRepository<MembershipInfo> {

  findByAssociationAndPortalUsers(association: Association, portalUsers: PortalUser[], status = GenericStatusConstant.ACTIVE): Promise<MembershipInfo[]> {
    if (!portalUsers.length) {
      return Promise.resolve(null);
    }
    const portalUserIds = portalUsers.map(portalUser => portalUser.id);
    return this.createQueryBuilder('membershipInfo')
      .distinct()
      .where('membershipInfo.association = :association', { association: association.id })
      .andWhere('membershipInfo.portalUser IN (:...portalUserIds)', { portalUserIds })
      .andWhere('membershipInfo.status = :status', { status })
      .getMany();
  }

  findByMemberships(memberships: Membership[]) {
    const membershipInfoIds = memberships.map(membership => membership.membershipInfoId);
    if (!membershipInfoIds) {
      return Promise.resolve(undefined);
    }
    return this.findByIds(membershipInfoIds);
  }


  findByIdentifierAndAssociationAndStatus(identifier: string, association: Association, status = GenericStatusConstant.ACTIVE) {
    return this.findOne({
      identifier,
      association,
      status,
    });
  }
}