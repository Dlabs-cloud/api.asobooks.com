import { Invoice } from '../domain/entity/invoice.entity';
import { Column } from 'typeorm';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

export class InvoiceResponseDto {

  surcharge: number;
  code: string;
  amount: number;
  amountPaid: number;
  payableAmount: number;
  paymentStatus: PaymentStatus;

}