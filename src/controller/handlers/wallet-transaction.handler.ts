import { WalletTransaction } from '../../domain/entity/wallet-transaction.entity';
import { WalletTransactionResponseDto } from '../../dto/wallet-transaction.response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletTransactionHandler {
  transform(walletTransaction: WalletTransaction) {
    const portalUser = walletTransaction?.initiatedBy?.portalUser;
    const membershipInfo = walletTransaction?.initiatedBy?.membershipInfo;
    const response: WalletTransactionResponseDto = {
      amount: walletTransaction.amount,
      date: walletTransaction.createdAt,
      initiatedBy: {
        firstName: portalUser?.firstName,
        lastName: portalUser?.lastName,
        identifier: membershipInfo?.identifier,
        email: portalUser.email,
        phoneNumber: portalUser.phoneNumber,
      },
      paymentType: walletTransaction.paymentType,
      previousWalletBalance: walletTransaction.previousWalletBalanceInMinorUnit,
      transactionReference: walletTransaction.paymentTransaction.reference,
      walletBalance: walletTransaction.walletBalance,
    };
    return response;
  }
}
