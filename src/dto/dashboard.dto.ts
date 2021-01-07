import { PaymentTransactionsDto } from './payment-transactions.dto';

export class DashboardDto {
  numberOfMembers: number;
  totalExpectedDue: number;
  totalAmountReceived: number;
  walletBalanceInMinorUnit: number;
  paymentTransactions: PaymentTransactionsDto[];
}