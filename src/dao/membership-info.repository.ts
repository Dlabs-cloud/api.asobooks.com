import { BaseRepository } from '../common/BaseRepository';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { Brackets, EntityRepository } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';
import { PortalUserQueryDto } from '../dto/portal-user-query.dto';
import { PortalAccount } from '../domain/entity/portal-account.entity';

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

  findByAssociationAndUserQuery(association: Association, query: PortalUserQueryDto, status = GenericStatusConstant.ACTIVE) {
    const builder = this.createQueryBuilder('membershipInfo')
      .distinct()
      .innerJoin(PortalUser, 'portalUser', 'membershipInfo.portalUser =  portalUser.id')
      .innerJoin(Membership, 'membership', 'membership.membershipInfo = membershipInfo.id ')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('membershipInfo.association = :association', { association: association.id })
      .andWhere('membershipInfo.status = :status', { status })
      .limit(query.limit)
      .offset(query.offset)
      .setParameter('status', status)
      .setParameter('association', association.id);

    if (query.type) {
      builder.andWhere('portalAccount.type = :portalAccountType', { portalAccountType: query.type });
    }

    if (query.query) {
      builder.andWhere(new Brackets(qb => {
        qb.where('CONCAT(portalUser.firstName,\'-\',portalUser.lastName) like :path', { path: `%${query.query}%` })
          .orWhere('portalUser.email like :path', { path: `%${query.query}%` })
          .orWhere('portalUser.username like :username', { username: `%${query.query}%` })
          .orWhere('membershipInfo.identifier like :identifier', { identifier: `%${query.query}%` });
      }));
    }
    return builder.getManyAndCount();
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