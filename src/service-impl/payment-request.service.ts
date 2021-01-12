import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentProvider } from '../domain/enums/payment-provider.enum';
import {
  FLUTTERWAVETRANSACTION,
  InitiateTransactionDto,
  PaymentTransactionService as ThirdPartyPaymentTransactionService,
  VerificationResponseDto,
} from '@dlabs/payment';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentRequestReferenceSequence } from '../core/sequenceGenerators/payment-request-reference.sequence';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { SettingRepository } from '../dao/setting.repository';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { PaymentRequestRepository } from '../dao/payment-request.repository';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { PaymentTransactionService } from './payment-transaction.service';
import { InvoiceService } from './invoice.service';
import { AssociationRepository } from '../dao/association.repository';
import { WalletService } from './wallet.service';
import { InitiateTransactionResponse } from '@dlabs/payment/dto/initiate-transaction.response';
import { Association } from '../domain/entity/association.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class PaymentRequestService {


  constructor(@Inject(FLUTTERWAVETRANSACTION) private readonly thirdPartyPaymentTransactionService: ThirdPartyPaymentTransactionService,
              private readonly connection: Connection,
              private readonly paymentTransactionService: PaymentTransactionService,
              private readonly invoiceService: InvoiceService,
              private readonly walletService: WalletService,
              private readonly paymentRequestSequence: PaymentRequestReferenceSequence,
              private readonly eventBus: EventBus) {
  }


  confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    return this.connection
      .getCustomRepository(PaymentRequestRepository)
      .findByReference(confirmPaymentDto.reference).then(pRequest => {
        if (!pRequest) {
          throw  new NotFoundException(`Payment reference with reference ${confirmPaymentDto.reference} cannot be found`);
        }
        pRequest.merchantReference = confirmPaymentDto.merchantReference;

        if (PaymentStatus.PAID !== pRequest.paymentStatus) {
          return this.updatePayment(pRequest, confirmPaymentDto.merchantReference);
        }
        return Promise.resolve(pRequest);

      });
  }

  updatePayment(paymentRequest: PaymentRequest, merchantReference: string) {
    return this.connection.transaction(entityManager => {
      return this.thirdPartyPaymentTransactionService
        .verify(merchantReference)
        .then((response: VerificationResponseDto) => {
          if (response.amountInMinorUnit >= paymentRequest.amountInMinorUnit) {
            paymentRequest.paymentStatus = PaymentStatus.PAID;
          } else {
            paymentRequest.paymentStatus = PaymentStatus.PARTIALLY_PAID;
          }
          paymentRequest.amountPaidInMinorUnit = response.amountInMinorUnit;
          paymentRequest.merchantReference = merchantReference;
          return entityManager.save(paymentRequest)
            .then(paymentRequest => {
              return this.paymentTransactionService
                .createPaymentTransaction(entityManager, paymentRequest, response)
                .then(paymentTransaction => {
                  return this.invoiceService.updateInvoice(entityManager, paymentRequest)
                    .then(invoice => {
                      return this.walletService.topUpWallet(entityManager, paymentTransaction).then(() => {
                        return Promise.resolve(paymentRequest);
                      });
                    });
                });
            });
        });
    });

  }


  makePayment(invoice: Invoice) {
    if (invoice.paymentStatus === PaymentStatus.PAID) {
      throw new IllegalArgumentException('Invoice has already been paid for');
    }
    return this.connection.getCustomRepository(AssociationRepository).findOne({
      id: invoice.associationId,
    }).then(association => {
      const paymentRequest = this.buildPaymentRequest(invoice, association);
      return this.paymentRequestSequence.next().then(seq => {
        paymentRequest.reference = seq;
        return paymentRequest.save();
      }).then(paymentRequest => {
        return this.connection.getCustomRepository(PortalUserRepository)
          .findByMembershipId(invoice.createdById)
          .then(user => {
            const transactionParameter = this.makePaymentInitiationData(paymentRequest, user);
            return Promise.resolve(transactionParameter);
          }).then(transactionParameter => {
            return this.connection.getCustomRepository(SettingRepository)
              .findByLabel('front_end_url', 'http://localhost:3000/api/v1/payments/confirm')
              .then(setting => {
                transactionParameter.redirectUrl = setting.value;
                return Promise.resolve(transactionParameter);
              });
          }).then(transactionParameter => {
            return this.thirdPartyPaymentTransactionService.initiate(transactionParameter);
          }).then(response => {
            const paymentResponse = this.buildPaymentRequestResponse(paymentRequest, response);
            return Promise.resolve(paymentResponse);
          });
      });
    });

  }

  private makePaymentInitiationData(paymentRequest: PaymentRequest, user: PortalUser) {
    const transactionParameter: InitiateTransactionDto = {
      amountInMinorUnit: paymentRequest.amountInMinorUnit,
      customer: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phonenumber: user.phoneNumber,
      },
      paymentOption: ['account', 'banktransfer', 'card', 'qr', 'ussd', 'paga'],
      redirectUrl: '',
      transactionRef: paymentRequest.reference,
    };
    return transactionParameter;
  }

  private buildPaymentRequestResponse(paymentRequest: PaymentRequest, response: InitiateTransactionResponse) {
    const paymentResponse: PaymentRequestDto = {
      amountInMinorUnit: paymentRequest.amountInMinorUnit,
      description: paymentRequest.description,
      amountPaidInMinorUnit: paymentRequest.amountPaidInMinorUnit,
      merchantReference: paymentRequest.merchantReference,
      paymentLink: response.paymentLink,
      paymentProvider: paymentRequest.paymentProvider,
      paymentStatus: paymentRequest.paymentStatus,
      paymentType: paymentRequest.paymentType,
      reference: paymentRequest.reference,
    };
    return paymentResponse;
  }

  private buildPaymentRequest(invoice: Invoice, association: Association) {
    const paymentRequest = new PaymentRequest();
    paymentRequest.amountInMinorUnit = invoice.payableAmountInMinorUnit;
    paymentRequest.description = `Payment for generated invoice with reference ${invoice.code}`;
    paymentRequest.invoice = invoice;
    paymentRequest.association = association;
    paymentRequest.paymentProvider = PaymentProvider.FLUTTER_WAVE;
    paymentRequest.paymentStatus = PaymentStatus.NOT_PAID;
    paymentRequest.paymentType = PaymentType.CREDIT;
    return paymentRequest;
  }
}