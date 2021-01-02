import { BaseEntity } from '../../common/base.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Bill } from './bill.entity';
import { PaymentRequest } from './payment-request.entity';

@Entity()
export class BillPaymentRequestEntity extends BaseEntity {
  @ManyToOne(() => Bill)
  bill: Bill;

  @ManyToOne(() => PaymentRequest)
  paymentRequest: PaymentRequest;
}