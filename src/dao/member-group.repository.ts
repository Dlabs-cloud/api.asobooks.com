import { BaseRepository } from '../common/BaseRepository';
import { MembershipGroup } from '../domain/entity/membership-group.entity';
import { EntityRepository } from 'typeorm';
import { Membership } from '../domain/entity/membership.entity';
import { Group } from '../domain/entity/group.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(MembershipGroup)
export class MemberGroupRepository extends BaseRepository<MembershipGroup> {

  public async findByMembershipAndGroup(member: Membership, group: Group, status = GenericStatusConstant.ACTIVE) {
    return this
      .createQueryBuilder('membershipGroup')
      .select()
      .where('membershipGroup.group = :group', { group: group.id })
      .andWhere('membershipGroup.membership = :member', { member: member.id })
      .andWhere('membershipGroup.status =:status', { status })
      .getOne();
  }

}