import { Customer } from '@dlabs/payment/dto/customer';

export type PaymentOption = 'account'
  | 'card' | 'banktransfer' | 'mpesa'
  | 'qr' | 'ussd' | 'paga' | '1voucher'

export class InitiateTransactionDto {
  transactionRef: string;
  amountInMinorUnit: number;
  paymentOption?: PaymentOption[] | PaymentOption;
  redirectUrl?: string;
  customer: Customer;

}
