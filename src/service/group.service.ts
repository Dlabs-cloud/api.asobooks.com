import { Injectable } from '@nestjs/common';
import { Group } from '../domain/entity/group.entity';
import { Connection, EntityManager } from 'typeorm';
import { GroupDto } from '../dto/group.dto';
import { GroupMembership } from '../domain/entity/group-membership.entity';
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


  public async addMember(entityManager: EntityManager, group: Group, ...memberships: Membership[]) {
    let groupMembers = await entityManager
      .getCustomRepository(MemberGroupRepository)
      .findByGroupAndStatusInMembership(group, null, ...memberships);

    let groupMemberships = memberships.filter(membership => {
      return !!!groupMembers.find(groupMember => groupMember.membershipId === membership.id);
    }).map(membership => {
      let membershipGroup = new GroupMembership();
      membershipGroup.group = group;
      membershipGroup.membership = membership;
      return membershipGroup;
    });
    return entityManager.save(groupMemberships);
  }

  public removeMember(entityManager: EntityManager, group: Group, ...membership: Membership[]) {
    return this.connection
      .getCustomRepository(MemberGroupRepository)
      .findByGroupAndStatusInMembership(group, null, ...membership)
      .then(groupMembers => {
        return groupMembers.map(groupMember => {
          groupMember.status = GenericStatusConstant.IN_ACTIVE;
          return entityManager.save(groupMember);
        });
      }).then(groupMemberships => {
        return Promise.all(groupMemberships);
      });

  }

}