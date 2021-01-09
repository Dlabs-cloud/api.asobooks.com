import { PaymentTransactionsDto } from './payment-transactions.dto';

export class DashboardDto {
  numberOfMembers: number;
  totalExpectedDueInMinorUnit: number;
  totalAmountReceivedInMinorUnit: number;
  walletBalanceInMinorUnit: number;
  paymentTransactions: PaymentTransactionsDto[];
}