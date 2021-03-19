import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { PaymentOption, VerificationResponseDto } from '@dlabs/payment';
import { PaymentChannel } from '../domain/enums/payment-channel.enum';
import { PaymentTransactionSequence } from '../core/sequenceGenerators/payment-transaction.sequence';
import { WalletService } from './wallet.service';

@Injectable()
export class PaymentTransactionService {

  constructor(private readonly connection: Connection,
              private readonly walletService: WalletService,
              private readonly paymentTransactionSequence: PaymentTransactionSequence) {
  }

  createPaymentTransaction(entityManager: EntityManager,
                           paymentRequest: PaymentRequest,
                           confirmationResponse: VerificationResponseDto,
                           datePaid: Date) {
    return this.connection
      .getCustomRepository(PaymentTransactionRepository)
      .findOneItemByStatus({
        paymentRequest: paymentRequest,
      }).then(paymentTransaction => {
        if (paymentTransaction) {
          throw new IllegalArgumentException('Payment transaction already exist for payment request');
        }
      }).then(() => {
        return this.paymentTransactionSequence
          .next()
          .then(paymentTransactionRef => {
            const pTransaction = new PaymentTransaction();
            pTransaction.paymentRequest = paymentRequest;
            pTransaction.amountInMinorUnit = confirmationResponse.amountInMinorUnit;
            pTransaction.datePaid = confirmationResponse.datePaid;
            pTransaction.paidBy = confirmationResponse.paidBy;
            pTransaction.reference = paymentTransactionRef;
            pTransaction.confirmedPaymentDate = datePaid;
            pTransaction.paymentChannel = this.getPaymentChannel(confirmationResponse.paymentOption);
            return entityManager
              .save(pTransaction)
              .then(pTransaction => this.walletService.topUpWallet(entityManager, pTransaction, paymentRequest.paymentType))
              .then(_ => Promise.resolve(pTransaction));
          });
      });

  }


  getPaymentChannel(paymentChannel: PaymentOption) {
    switch (paymentChannel) {
      case 'account':
        return PaymentChannel.ACCOUNT;
      case 'banktransfer':
        return PaymentChannel.BANK_TRANSFER;
      case 'card':
        return PaymentChannel.CARD;
      case 'paga':
        return PaymentChannel.PAGA;
      case 'qr':
        return PaymentChannel.QR;
      case 'ussd':
        return PaymentChannel.USSD;
      default:
        throw new IllegalArgumentException('Payment channel does not exist');
    }
  }
}
