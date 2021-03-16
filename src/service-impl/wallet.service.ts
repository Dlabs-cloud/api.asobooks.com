import { Association } from '../domain/entity/association.entity';
import { EntityManager } from 'typeorm';
import { Wallet } from '../domain/entity/wallet.entity';
import { BankInfo } from '../domain/entity/bank-info.entity';
import { WalletSequence } from '../core/sequenceGenerators/wallet.sequence';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { Connection } from 'typeorm/connection/Connection';
import { WalletRepository } from '../dao/wallet.repository';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { WalletWithdrawalDto } from '../dto/wallet-withdrawal.dto';
import { Membership } from '../domain/entity/membership.entity';
import { WalletWithdrawalSequence } from '../core/sequenceGenerators/wallet-withdrawal.sequence';
import { FLUTTERWAVEWITHDRAWAL, WithdrawalDto, WithdrawalService } from '@dlabs/payment';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../core/cron.enum';
import { Queue } from 'bull';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { WalletWithdrawalEnum } from '../domain/enums/wallet.withdrawal.enum';
import { BankRepository } from '../dao/bank.repository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';

@Injectable()
export class WalletService {

  constructor(private readonly walletSequence: WalletSequence,
              private readonly connection: Connection,
              private readonly authenticationUtils: AuthenticationUtils,
              @InjectQueue(Queues.WALLET_WITHDRAWAL) private readonly walletWithDrawlQueue: Queue,
              @Inject(FLUTTERWAVEWITHDRAWAL) private readonly withdrawalService: WithdrawalService,
              private readonly walletWithdrawalSequence: WalletWithdrawalSequence) {
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


  withDraw(walletWithdrawal: WalletWithdrawal) {
    return this.connection.transaction(entityManager => {
      return entityManager.getCustomRepository(WalletRepository)
        .findOne({ status: GenericStatusConstant.ACTIVE, id: walletWithdrawal.walletId })
        .then(wallet => {
          if (wallet.availableBalanceInMinorUnits < walletWithdrawal.amountInMinorUnit) {
            walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.INSUFFICIENT_FUNDS;
            return entityManager.save(walletWithdrawal);
          }
          return entityManager.getCustomRepository(BankRepository)
            .findOne({ id: walletWithdrawal.bankInfo.bankId })
            .then(bank => {
              const payload: WithdrawalDto = {
                accountNumber: wallet.bank.accountNumber,
                amountInMinorUnit: walletWithdrawal.amountInMinorUnit,
                bank: bank.code,
                description: walletWithdrawal.description,
                receiversName: wallet.reference,
                reference: walletWithdrawal.reference,
              };
              return this.withdrawalService
                .withdraw(payload)
                .then(response => {
                  wallet.availableBalanceInMinorUnits = +wallet.availableBalanceInMinorUnits - +walletWithdrawal.amountInMinorUnit;
                  walletWithdrawal.merchantReference = response.reference;
                  walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.PENDING;
                  return entityManager.save(walletWithdrawal);
                }).catch(error => {
                  walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.FAILED;
                  return entityManager.save(walletWithdrawal);
                });
            });


        });
    });


  }

  initiateWithdrawal(portalUser: PortalUser, membership: Membership, association: Association, walletInfo: WalletWithdrawalDto) {
    return this.authenticationUtils.comparePassword(walletInfo.password, portalUser.password)
      .then(isValid => {
        if (isValid) {
          throw new IllegalArgumentException('Provided password is invalid');
        }
        return this.connection.transaction(entityManager => {
          return entityManager
            .getCustomRepository(WalletRepository)
            .findByAssociation(association)
            .then(wallet => {
              return this.walletWithdrawalSequence
                .next()
                .then(reference => {
                  const walletWithdrawal = new WalletWithdrawal();
                  walletWithdrawal.amountInMinorUnit = walletInfo.amountInMinorUnit;
                  walletWithdrawal.bankInfo = wallet.bank;
                  walletWithdrawal.initiatedBy = membership;
                  walletWithdrawal.reference = reference;
                  walletWithdrawal.wallet = wallet;
                  walletWithdrawal.description = `${association.name} Association withdrawal from wallet`;
                  return entityManager.save(walletWithdrawal);
                }).then(walletWithdrawal => {
                  return this.walletWithDrawlQueue.add(walletWithdrawal)
                    .then(_ => {
                      return Promise.resolve(walletWithdrawal);
                    });
                });
            });
        });
      });


  }

  topUpWallet(entityManager: EntityManager, paymentTransaction: PaymentTransaction) {
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
        const walletTransaction = new WalletTransaction();
        walletTransaction.amount = Number(paymentTransaction.amountInMinorUnit);
        walletTransaction.paymentTransaction = paymentTransaction;
        walletTransaction.paymentType = PaymentType.CREDIT;
        walletTransaction.wallet = wallet;
        walletTransaction.previousWalletBalanceInMinorUnit = Number(wallet.availableBalanceInMinorUnits);
        walletTransaction.walletBalance = +wallet.availableBalanceInMinorUnits + +paymentTransaction.amountInMinorUnit;
        return entityManager.save(walletTransaction)
          .then(() => {
            wallet.availableBalanceInMinorUnits = Number(walletTransaction.walletBalance);
            return entityManager.save(wallet);
          });
      });
  }
}
