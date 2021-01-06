import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PaymentProvider } from '../domain/enums/payment-provider.enum';
import { PaymentType } from '../domain/enums/payment-type.enum';

export class PaymentRequestDto {
  amountInMinorUnit: number;
  merchantReference: string;
  reference: string;
  description: string;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  paymentType: PaymentType;
  paymentLink?: string;
  amountPaidInMinorUnit: number;
  paymentTransactionId?: number;
}