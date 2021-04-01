import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { Wallet } from '../domain/entity/wallet.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { InitiateTransactionDto } from '@dlabs/payment';

@Injectable()
export class WalletTransactionService {

  createWalletTransaction(entityManger: EntityManager, paymentType: PaymentType, wallet: Wallet, paymentTransaction: PaymentTransaction) {
    const initiatedBy = paymentTransaction?.paymentRequest?.initiatedBy;
    if (!initiatedBy) {
      throw new InternalServerErrorException('Error when processing a wallet withdrawal request');
    }
    const walletTransaction = new WalletTransaction();
    walletTransaction.amountInMinorUnit = Number(paymentTransaction.amountInMinorUnit);
    walletTransaction.paymentTransaction = paymentTransaction;
    walletTransaction.wallet = wallet;
    walletTransaction.initiatedBy = initiatedBy;
    walletTransaction.paymentType = paymentType;
    walletTransaction.previousWalletBalanceInMinorUnit = Number(wallet.availableBalanceInMinorUnits);
    if (PaymentType.CREDIT === paymentType) {
      walletTransaction.walletBalanceInMinorUnit = +wallet.availableBalanceInMinorUnits + +paymentTransaction.amountInMinorUnit;
    }
    if (PaymentType.DEBIT === paymentType) {
      walletTransaction.walletBalanceInMinorUnit = +wallet.availableBalanceInMinorUnits - +paymentTransaction.amountInMinorUnit;
    }

    if (PaymentType.WALLET_REVERSAL === paymentType) {
      walletTransaction.walletBalanceInMinorUnit = +wallet.availableBalanceInMinorUnits + +paymentTransaction.amountInMinorUnit;
    }
    return entityManger.save(walletTransaction);
  }

}
