import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Membership } from './membership.entity';
import { Association } from './association.entity';

@Entity()
export class Invoice extends BaseEntity {
  @Column()
  surchargeInMinorUnit: number;
  @Column({
    unique: true,
  })
  code: string;
  @Column({
    type: 'bigint',
  })
  amountInMinorUnit: number;
  @Column({
    default: 0,
    type: 'bigint',
  })
  amountPaidInMinorUnit: number;
  @Column({
    type: 'bigint',
  })
  payableAmountInMinorUnit: number;
  @Column({
    default: PaymentStatus.NOT_PAID,
  })
  paymentStatus: PaymentStatus;

  @ManyToOne(() => Membership)
  @JoinColumn({ name: 'createdById', referencedColumnName: 'id' })
  createdBy: Membership;

  @ManyToOne(() => Association)
  @JoinColumn({ name: 'associationId', referencedColumnName: 'id' })
  association: Association;
  @Column({
    nullable: true,
  })
  associationId: number;

  @Column({
    nullable: true,
  })
  createdById: number;
  @Column({ nullable: true })
  datePaid: Date;


}