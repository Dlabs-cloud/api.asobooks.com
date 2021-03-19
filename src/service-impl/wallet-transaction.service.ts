import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { Wallet } from '../domain/entity/wallet.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';

@Injectable()
export class WalletTransactionService {

  createWalletTransaction(entityManger: EntityManager, paymentType: PaymentType, wallet: Wallet, paymentTransaction: PaymentTransaction) {
    const walletTransaction = new WalletTransaction();
    walletTransaction.amount = Number(paymentTransaction.amountInMinorUnit);
    walletTransaction.paymentTransaction = paymentTransaction;
    walletTransaction.wallet = wallet;
    walletTransaction.paymentType = paymentType;
    walletTransaction.previousWalletBalanceInMinorUnit = Number(wallet.availableBalanceInMinorUnits);
    if (PaymentType.CREDIT === paymentType) {
      walletTransaction.walletBalance = +wallet.availableBalanceInMinorUnits + +paymentTransaction.amountInMinorUnit;
    }
    if (PaymentType.DEBIT === paymentType) {
      walletTransaction.walletBalance = +wallet.availableBalanceInMinorUnits - +paymentTransaction.amountInMinorUnit;
    }

    if (PaymentType.WALLET_REVERSAL === paymentType) {
      walletTransaction.walletBalance = +wallet.availableBalanceInMinorUnits + +paymentTransaction.amountInMinorUnit;
    }
    return entityManger.save(walletTransaction);
  }

}
