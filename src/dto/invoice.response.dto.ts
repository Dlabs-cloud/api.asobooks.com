import { PaymentStatus } from '../domain/enums/payment-status.enum';

export class InvoiceResponseDto {

  surcharge: number;
  code: string;
  amount: number;
  amountPaid: number;
  payableAmount: number;
  paymentStatus: PaymentStatus;

}