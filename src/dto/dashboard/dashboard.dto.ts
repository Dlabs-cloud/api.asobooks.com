import {TransactionDto} from "./transaction.dto";

export class DashboardDto {
    metrics: {
        countOfMembers: number;
        expectedDues: number;
        totalAmountReceived: number;
        walletBalance: number;
    }
    recentTransactions: Array<TransactionDto>
}