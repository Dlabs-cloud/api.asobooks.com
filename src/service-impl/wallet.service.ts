import { Association } from '../domain/entity/association.entity';
import { EntityManager } from 'typeorm';
import { Wallet } from '../domain/entity/wallet.entity';
import { BankInfo } from '../domain/entity/bank-info.entity';
import { WalletSequence } from '../core/sequenceGenerators/wallet.sequence';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { Connection } from 'typeorm/connection/Connection';
import { WalletRepository } from '../dao/wallet.repository';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { WalletTransactionService } from './wallet-transaction.service';

@Injectable()
export class WalletService {

  constructor(private readonly walletSequence: WalletSequence,
              private readonly walletTransactionService: WalletTransactionService,
              private readonly connection: Connection) {
  }


  createAssociationWallet(entityManager: EntityManager, association: Association, bankInfo?: BankInfo) {
    return this.walletSequence.next().then(reference => {
      let wallet = new Wallet();
      wallet.association = association;
      wallet.availableBalanceInMinorUnits = 0;
      wallet.bank = bankInfo;
      wallet.reference = reference;
      return entityManager.save(wallet);
    });
  }

  topUpWallet(entityManager: EntityManager, paymentTransaction: PaymentTransaction, paymentType: PaymentType) {
    //Todo: Depending on the type it is important that u check the type to know if it is adding or deducting the wallet
    const association = paymentTransaction.paymentRequest.association;
    if (!association) {
      throw new InternalServerErrorException('Payment transaction must have association');
    }
    return this.connection
      .getCustomRepository(WalletRepository)
      .findByAssociation(association)
      .then(wallet => {
        if (!wallet) {
          throw new InternalServerErrorException('Wallet is not created for association');
        }

        return this.walletTransactionService
          .createWalletTransaction(entityManager, paymentType, wallet, paymentTransaction)
          .then((walletTransaction) => {
            wallet.availableBalanceInMinorUnits = Number(walletTransaction.walletBalance);
            return entityManager.save(wallet);
          });

      });
  }


}
