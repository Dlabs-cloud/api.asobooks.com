import { PaymentOption } from '@dlabs/payment/dto/initiate-transaction.dto';

export declare type Status = 'successful' | 'failed';

export class VerificationResponseDto {
  amountInMinorUnit: number;
  paymentOption: PaymentOption;
  transactionReference: string;
  merchantReference: string;
  status: Status;
  narration: string;
  currency: 'NGN';
  datePaid: Date;
  paidBy: string;
}