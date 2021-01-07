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

@Injectable()
export class PaymentTransactionService {

  constructor(private readonly connection: Connection,
              private readonly paymentTransactionSequence: PaymentTransactionSequence) {
  }

  createPaymentTransaction(entityManager: EntityManager,
                           paymentRequest: PaymentRequest,
                           confirmationResponse: VerificationResponseDto) {
    return this.connection.getCustomRepository(PaymentTransactionRepository).findOneItemByStatus({
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
          pTransaction.paymentChannel = this.getPaymentChannel(confirmationResponse.paymentOption);
          return entityManager.save(pTransaction);
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