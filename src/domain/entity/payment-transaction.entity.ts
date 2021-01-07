import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PaymentRequest } from './payment-request.entity';
import { BaseEntity } from '../../common/base.entity';
import { PaymentChannel } from '../enums/payment-channel.enum';


@Entity()
export class PaymentTransaction extends BaseEntity {
  @Column({
    type: 'bigint',
  })
  amountInMinorUnit: number;
  @Column({
    type: 'enum',
    enum: PaymentChannel,
  })
  paymentChannel: PaymentChannel;
  @Column({
    type: 'timestamp',
  })
  datePaid: Date;

  @OneToOne(() => PaymentRequest, { eager: true })
  @JoinColumn({ name: 'paymentRequestId' })
  paymentRequest: PaymentRequest;

  @Column({
    nullable: true,
  })
  paymentRequestId: number;

  @Column()
  paidBy: string;

  @Column({
    unique: true,
  })
  reference: string;
}