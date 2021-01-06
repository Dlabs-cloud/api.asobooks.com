import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { PaymentOption, VerificationResponseDto } from '@dlabs/payment';
import { PaymentChannel } from '../domain/enums/payment-channel.enum';

@Injectable()
export class PaymentTransactionService {

  constructor(private readonly connection: Connection) {
  }

  createPaymentTransaction(entityManager: EntityManager,
                           paymentRequest: PaymentRequest,
                           confirmationResponse: VerificationResponseDto) {
    this.connection.getCustomRepository(PaymentTransactionRepository).findOneItemByStatus({
      paymentRequest: paymentRequest,
    }).then(paymentTransaction => {
      if (paymentTransaction) {
        throw new IllegalArgumentException('Payment transaction already exist for payment request');
      }
    });
    const pTransaction = new PaymentTransaction();
    pTransaction.paymentRequest = paymentRequest;
    pTransaction.amountInMinorUnit = confirmationResponse.amountInMinorUnit;
    pTransaction.datePaid = confirmationResponse.datePaid;
    pTransaction.paidBy = confirmationResponse.paidBy;
    pTransaction.paymentChannel = this.getPaymentChannel(confirmationResponse.paymentOption);
    return entityManager.save(pTransaction);
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