import { PaymentOption } from '@dlabs/payment/dto/initiate-transaction.dto';
import { Customer } from '@dlabs/payment/dto/customer';

export class FlutterWaveInitiateTransactionDto {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_options: PaymentOption | PaymentOption[];
  customer: Customer;
}

