import { BaseRepository } from '../common/BaseRepository';
import { MembershipRole } from '../domain/entity/membership-role.entity';
import { EntityRepository } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(MembershipRole)
export class MembershipRoleRepository extends BaseRepository<MembershipRole> {

  findByPortalUser(portalUser: PortalUser, status = GenericStatusConstant.ACTIVE) {
    return this
      .createQueryBuilder('membershipRole')
      .innerJoinAndSelect('membershipRole.membership', 'membership')
      .innerJoinAndSelect('membership.portalAccount', 'portalAccount')
      .innerJoinAndSelect('membershipRole.role', 'role')
      .where('membership.status = :status', { status })
      .andWhere('membershipRole.status = :status', { status })
      .andWhere('membership.portalUser = :portalUser', { portalUser: portalUser.id })
      .andWhere('role.status = :status', { status })
      .getMany();
  }
}
