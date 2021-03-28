import { PaymentType } from '../domain/enums/payment-type.enum';

export class PaymentTransactionsDto {
  membershipReference: string;
  amountInMinorUnit: number;
  paymentDate: Date;
  transactionReference: string;
  paidByFirstName: string;
  paidByLastLastName: string;
  paymentType: PaymentType;
}
