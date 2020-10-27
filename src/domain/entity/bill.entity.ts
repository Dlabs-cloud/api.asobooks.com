import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Subscription } from './subcription.entity';
import { Membership } from './membership.entity';

@Entity()
export class Bill extends BaseEntity {

  @Column()
  code: string;
  @ManyToOne(() => Membership)
  membership: Membership;
  @Column()
  currentAmountInMinorUnit: number;
  @Column()
  description: string;
  @Column({
    nullable: true,
  })
  vatInPercentage: number;
  @Column({
    nullable: true,
  })
  disCountInPercentage: number;
  @Column()
  payableAmountInMinorUnit: number;
  @Column()
  totalAmountPaidInMinorUnit: number;
  @ManyToOne(() => Subscription, {
    nullable: true,
  })
  @JoinColumn()
  subscription: Subscription;
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastDispatchDate?: Date;
}