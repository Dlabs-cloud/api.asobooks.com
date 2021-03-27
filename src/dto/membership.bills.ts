import { PaymentStatus } from '../domain/enums/payment-status.enum';

export class MembershipBills {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  paymentStatus: PaymentStatus;
  paymentDate: Date | string;
  transactionReference: string;
  email: string;
  billName: string;
  amountInMinorUnit: number;
}
