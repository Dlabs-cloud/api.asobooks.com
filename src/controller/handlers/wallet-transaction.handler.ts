import { WalletTransaction } from '../../domain/entity/wallet-transaction.entity';
import { WalletTransactionResponseDto } from '../../dto/wallet-transaction.response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletTransactionHandler {
  transform(walletTransaction: WalletTransaction) {
    const portalUser = walletTransaction?.initiatedBy?.portalUser;
    const membershipInfo = walletTransaction?.initiatedBy?.membershipInfo;
    const paymentTransaction = walletTransaction.paymentTransaction;
    const response: WalletTransactionResponseDto = {
      amountInMinorUnit: +walletTransaction.amountInMinorUnit,
      date: walletTransaction.createdAt,
      initiatedBy: {
        firstName: portalUser?.firstName,
        lastName: portalUser?.lastName,
        identifier: membershipInfo?.identifier,
        email: portalUser.email,
        phoneNumber: portalUser.phoneNumber,
      },
      paymentType: walletTransaction.paymentType,
      previousWalletBalanceInMinorUnit: +walletTransaction.previousWalletBalanceInMinorUnit,
      transactionReference: paymentTransaction.reference,
      walletBalanceInMinorUnit: +walletTransaction.walletBalanceInMinorUnit,
    };
    return response;
  }
}
