import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Membership } from './membership.entity';
import { Role } from './role.entity';
import { PortalUser } from './portal-user.entity';

@Entity()
export class MembershipRole extends BaseEntity {
  @ManyToOne(() => Membership)
  membership: Membership;
  @ManyToOne(() => Role)
  role: Role;


}