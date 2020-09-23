import { Injectable } from '@nestjs/common';
import { Association } from '../domain/entity/association.entity';
import { Group } from '../domain/entity/group.entity';
import { Connection, EntityManager } from 'typeorm';
import { GroupDto } from '../dto/group.dto';
import { MembershipGroup } from '../domain/entity/membership-group.entity';
import { Membership } from '../domain/entity/membership.entity';

@Injectable()
export class GroupService {

  public createGroup(entityManager: EntityManager, group: GroupDto) {
    let newGroup = new Group();
    newGroup.association = group.association;
    newGroup.name = group.name;
    newGroup.type = group.type;
    return entityManager.save(newGroup);
  }


  public addMember(entityManager: EntityManager, group: Group, membership: Membership) {
    let membershipGroup = new MembershipGroup();
    membershipGroup.group = group;
    membershipGroup.membership = membership;
    return entityManager.save(membershipGroup);
  }
}