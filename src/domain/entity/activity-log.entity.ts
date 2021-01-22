import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Membership } from './membership.entity';
import { ActivityTypeConstant } from '../enums/activity-type-constant';
import { Association } from './association.entity';
import { PortalUser } from './portal-user.entity';

@Entity()
export class ActivityLog extends BaseEntity {
  @Column()
  description: string;

  @Column()
  activityType: ActivityTypeConstant;

  @OneToOne(() => PortalUser)
  @JoinColumn()
  createdBy: PortalUser;

  @ManyToOne(() => Association)
  @JoinColumn({ name: 'associationId', referencedColumnName: 'id' })
  association: Association;
}