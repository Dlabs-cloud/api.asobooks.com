import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentProvider } from '../domain/enums/payment-provider.enum';
import {
  FLUTTERWAVETRANSACTION,
  FlutterWaveInitiateTransactionDto,
  PaymentTransaction,
  VerificationResponseDto, InitiateTransactionDto,
} from '@dlabs/payment';
import { GatewayTimeoutException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { Association } from '../domain/entity/association.entity';
import { AssociationRepository } from '../dao/association.repository';
import { WalletService } from './wallet.service';
import { IoTThingsGraph } from 'aws-sdk';
import { ServiceUnavailableException } from '../exception/ServiceUnavailableException';

@Injectable()
export class PaymentRequestService {


  constructor(@Inject(FLUTTERWAVETRANSACTION) private readonly paymentTransaction: PaymentTransaction,
              private readonly connection: Connection,
              private readonly paymentTransactionService: PaymentTransactionService,
              private readonly invoiceService: InvoiceService,
              private readonly walletService: WalletService,
              private readonly paymentRequestSequence: PaymentRequestReferenceSequence) {
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
      return this.paymentTransaction
        .verify(merchantReference)
        .then((response: VerificationResponseDto) => {
          if (response.amountInMinorUnit >= paymentRequest.amountInMinorUnit) {
            paymentRequest.paymentStatus = PaymentStatus.PAID;
          } else {
            paymentRequest.paymentStatus = PaymentStatus.PARTIALLY_PAID;
          }
          paymentRequest.amountPaidInMinorUnit = response.amountInMinorUnit;
          paymentRequest.merchantReference = merchantReference;
          return entityManager.save(paymentRequest).then(paymentRequest => {
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
        }).catch(e => {
          console.log(e);
          throw new ServiceUnavailableException('Service is not available to confirm payment');
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
      const paymentRequest = new PaymentRequest();
      paymentRequest.amountInMinorUnit = invoice.payableAmountInMinorUnit;
      paymentRequest.description = `Payment for generated invoice with reference ${invoice.code}`;
      paymentRequest.invoice = invoice;
      paymentRequest.association = association;
      paymentRequest.paymentProvider = PaymentProvider.FLUTTER_WAVE;
      paymentRequest.paymentStatus = PaymentStatus.NOT_PAID;
      paymentRequest.paymentType = PaymentType.CREDIT;
      return this.paymentRequestSequence.next().then(seq => {
        paymentRequest.reference = seq;
        return paymentRequest.save();
      }).then(paymentRequest => {
        return this.connection.getCustomRepository(PortalUserRepository)
          .findByMembershipId(invoice.createdById)
          .then(user => {
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
            return Promise.resolve(transactionParameter);
          }).then(transactionParameter => {
            return this.connection.getCustomRepository(SettingRepository)
              .findByLabel('front_end_url', 'http://localhost:3000/api/v1')
              .then(setting => {
                transactionParameter.redirectUrl = setting.value;
                return Promise.resolve(transactionParameter);
              });
          }).then(transactionParameter => {
            return this.paymentTransaction.initiate(transactionParameter);
          }).then(response => {
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
            return Promise.resolve(paymentResponse);
          });
      });
    });

  }
}