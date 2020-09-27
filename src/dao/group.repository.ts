import { BaseRepository } from '../common/BaseRepository';
import { Group } from '../domain/entity/group.entity';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { Membership } from '../domain/entity/membership.entity';
import { GroupMembership } from '../domain/entity/group-membership.entity';

@EntityRepository(Group)
export class GroupRepository extends BaseRepository<Group> {


  public findByAssociation(association: Association, type: GroupTypeConstant, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('group')
      .select()
      .innerJoin(Association, 'association', 'group.association = association.id')
      .where('association.status = :status', { status })
      .andWhere('association.id = :association', { association: association.id })
      .andWhere('group.type = :type', { type })
      .getMany();
  }


  public findByAssociationAndMembershipAndType(association: Association,
                                               membership: Membership,
                                               type: GroupTypeConstant,
                                               status = GenericStatusConstant.ACTIVE) {

    return this.createQueryBuilder('group')
      .select()
      .innerJoin(Association, 'association', 'group.association = association.id')
      .innerJoin(GroupMembership, 'membershipGroup', 'membershipGroup.group = group.id')
      .where('membershipGroup.membership = :membership', { membership: membership.id })
      .andWhere('association.id = :association', { association: association.id })
      .andWhere('group.type = :type', { type: type })
      .andWhere('group.status = :status', { status })
      .getMany();
  }


}