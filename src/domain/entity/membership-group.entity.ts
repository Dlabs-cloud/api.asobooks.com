import { Group } from './group.entity';
import { Membership } from './membership.entity';
import { BaseEntity } from '../../common/base.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class MembershipGroup extends BaseEntity {

  @ManyToOne(() => Group)
  group: Group;

  @ManyToOne(() => Membership)
  membership: Membership;

}