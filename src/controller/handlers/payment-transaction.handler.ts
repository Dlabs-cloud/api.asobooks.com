import { Injectable } from '@nestjs/common';
import { PaymentTransaction } from '../../domain/entity/payment-transaction.entity';

@Injectable()
export class PaymentTransactionHandler {

  transform(paymentTransaction: PaymentTransaction[]) {

  }
}