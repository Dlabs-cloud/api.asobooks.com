import { Injectable } from '@nestjs/common';
import { Group } from '../domain/entity/group.entity';
import { Connection, EntityManager } from 'typeorm';
import { GroupDto } from '../dto/group.dto';
import { MembershipGroup } from '../domain/entity/membership-group.entity';
import { Membership } from '../domain/entity/membership.entity';
import { GroupRepository } from '../dao/group.repository';
import { MemberGroupRepository } from '../dao/member-group.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@Injectable()
export class GroupService {

  constructor(private readonly connection: Connection) {
  }

  public createGroup(entityManager: EntityManager, group: GroupDto) {
    let newGroup = new Group();
    newGroup.association = group.association;
    newGroup.name = group.name;
    newGroup.type = group.type;
    return entityManager.save(newGroup);
  }


  public async addMember(group: Group, membership: Membership, entityManager: EntityManager = null) {
    let groupMember = await entityManager
      .getCustomRepository(MemberGroupRepository)
      .findByMembershipAndGroup(membership, group);
    if (groupMember) {
      return groupMember;
    }
    let membershipGroup = new MembershipGroup();
    membershipGroup.group = group;
    membershipGroup.membership = membership;
    if (entityManager) {
      return entityManager.save(membershipGroup);
    }
    return this.connection.getCustomRepository(GroupRepository).save(membershipGroup);
  }

  public async removeMember(group: Group, membership: Membership, entityManager: EntityManager) {
    let groupMember = await this.connection
      .getCustomRepository(MemberGroupRepository)
      .findByMembershipAndGroup(membership, group);
    groupMember.status = GenericStatusConstant.IN_ACTIVE;
    await entityManager.save(groupMember);

  }

}