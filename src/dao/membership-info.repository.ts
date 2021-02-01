import { BaseRepository } from '../common/BaseRepository';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { EntityRepository } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(MembershipInfo)
export class MembershipInfoRepository extends BaseRepository<MembershipInfo> {

  findByAssociationAndPortalUsers(association: Association, portalUsers: PortalUser[], status = GenericStatusConstant.ACTIVE): Promise<MembershipInfo[]> {
    if (!portalUsers.length) {
      return Promise.resolve(null);
    }
    const portalUserIds = portalUsers.map(portalUser => portalUser.id);
    return this.createQueryBuilder('membershipInfo')
      .where('membershipInfo.association = :association', { association: association.id })
      .andWhere('membershipInfo.portalUser IN (:...portalUserIds)', { portalUserIds })
      .andWhere('membershipInfo.status = :status', { status })
      .getMany();
  }
}