import { BaseEntity } from '../../../../common/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PaymentChannel } from '../enum/payment-channel.enum';
import { PaymentRequest } from './payment-request.entity';


@Entity()
export class PaymentTransaction extends BaseEntity {
  @Column({
    type: 'bigint',
  })
  amountInUnit: number;
  @Column({
    type: 'enum',
    enum: PaymentChannel,
  })
  paymentChannel: PaymentChannel;
  @Column({
    type: 'timestamp',
  })
  datePaid: Date;

  @OneToOne(() => PaymentRequest)
  @JoinColumn({ name: 'paymentRequestId' })
  paymentRequest: PaymentRequest;

}