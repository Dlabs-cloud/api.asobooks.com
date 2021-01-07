export class PaymentTransactionsDto {
  paidBy: string;
  membershipReference: string;
  amountInMinorUnit: number;
  paymentDate: Date;
  transactionReference: string;

}