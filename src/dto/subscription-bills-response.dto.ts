import { PaymentStatus } from '../domain/enums/payment-status.enum';

export class SubscriptionBillsResponseDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  transactionReference: string;
}