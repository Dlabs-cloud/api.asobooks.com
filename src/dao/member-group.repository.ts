import { BaseRepository } from '../common/BaseRepository';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { EntityRepository } from 'typeorm';
import { Membership } from '../domain/entity/membership.entity';
import { Group } from '../domain/entity/group.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(GroupMembership)
export class MemberGroupRepository extends BaseRepository<GroupMembership> {

  public async findByGroupAndStatusInMembership(group: Group, status = GenericStatusConstant.ACTIVE, ...members: Membership[]) {
    let memberIds = members.map(member => member.id);
    return this
      .createQueryBuilder('membershipGroup')
      .select()
      .where('membershipGroup.group = :group', { group: group.id })
      .andWhere('membershipGroup.membership IN (:...members)', { members: memberIds })
      .andWhere('membershipGroup.status =:status', { status })
      .getMany();
  }


}