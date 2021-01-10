import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Subscription } from './subcription.entity';
import { Membership } from './membership.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentRequest } from './payment-request.entity';

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
  @Column({ nullable: true })
  subscriptionId: number;
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastDispatchDate?: Date;
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.NOT_PAID,
  })
  paymentStatus: PaymentStatus;
  @Column({ nullable: true })
  datePaid: Date;

}