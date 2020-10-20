import { BaseEntity } from '../../../../common/base.entity';
import { Column, Entity } from 'typeorm';
import { PaymentStatus } from '../enum/payment-status.enum';
import { PaymentProvider } from '../enum/payment-provider.enum';
import { PaymentType } from '../enum/payment-type.enum';

@Entity()
export class PaymentRequest extends BaseEntity {
  @Column({
    type: 'bigint',
  })
  amountInMinorUnit: number;
  @Column({
    nullable: true,
    unique: true,
  })
  merchantReference: string;
  @Column()
  customerReference: string;
  @Column()
  reference: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.NOT_PAID,

  })
  paymentStatus: PaymentStatus;
  @Column({
    type: 'enum',
    enum: PaymentProvider,

  })
  paymentProvider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentType,

  })
  paymentType: PaymentType;

}