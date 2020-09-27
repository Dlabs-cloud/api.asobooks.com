import { Group } from './group.entity';
import { Membership } from './membership.entity';
import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class GroupMembership extends BaseEntity {

  @ManyToOne(() => Group)
  group: Group;

  @ManyToOne(() => Membership)
  membership: Membership;


  @Column({
    nullable: true,
  })
  membershipId: number;

}