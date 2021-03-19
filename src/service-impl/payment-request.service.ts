import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentProvider } from '../domain/enums/payment-provider.enum';
import {
  FLUTTERWAVETRANSACTION,
  FLUTTERWAVEWITHDRAWAL,
  InitiateTransactionDto,
  PaymentTransactionService as ThirdPartyPaymentTransactionService,
  VerificationResponseDto,
  WithdrawalDto,
  WithdrawalService,
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
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { WalletRepository } from '../dao/wallet.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { WalletWithdrawalEnum } from '../domain/enums/wallet.withdrawal.enum';
import { BankRepository } from '../dao/bank.repository';
import { Wallet } from '../domain/entity/wallet.entity';

@Injectable()
export class PaymentRequestService {


  constructor(@Inject(FLUTTERWAVETRANSACTION) private readonly thirdPartyPaymentTransactionService: ThirdPartyPaymentTransactionService,
              @Inject(FLUTTERWAVEWITHDRAWAL) private readonly withdrawalService: WithdrawalService,
              private readonly connection: Connection,
              private readonly paymentTransactionService: PaymentTransactionService,
              private readonly invoiceService: InvoiceService,
              private readonly walletService: WalletService,
              private readonly paymentRequestSequence: PaymentRequestReferenceSequence) {
  }


  payout(walletWithdrawal: WalletWithdrawal) {
    return this.connection.transaction(entityManager => {
      const wallet = walletWithdrawal.wallet;
      if (+wallet.availableBalanceInMinorUnits < +walletWithdrawal.amountInMinorUnit) {
        walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.INSUFFICIENT_FUNDS;
        return entityManager.save(walletWithdrawal);
      }
      return this
        .buildPaymentRequestFromWalletWithdrawal(walletWithdrawal, wallet)
        .then(paymentRequest => {
          return entityManager.save(paymentRequest).then(_ => {
            const bank = walletWithdrawal.bankInfo.bank;
            const payload: WithdrawalDto = {
              accountNumber: wallet.bank.accountNumber,
              amountInMinorUnit: walletWithdrawal.amountInMinorUnit,
              bank: bank.flutterWaveReference,
              description: walletWithdrawal.description,
              receiversName: wallet.reference,
              reference: walletWithdrawal.reference,
            };
            return this.withdrawalService
              .withdraw(payload)
              .then(response => {
                walletWithdrawal.merchantReference = response.transactionReference;
                walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.WAITING_CONFIRMATION;
                return entityManager
                  .save(walletWithdrawal)
                  .then(_ => this.paymentTransactionService.createPaymentTransaction(entityManager, paymentRequest, response, new Date()))
                  .then(_ => {
                    paymentRequest.paymentStatus = PaymentStatus.AWAITING_CONFIRMATION;
                    return entityManager.save(paymentRequest);
                  }).then(_ => Promise.resolve(walletWithdrawal));
              }).catch(error => {
                console.log(error);
                const data = error?.data?.data;
                walletWithdrawal.merchantReference = data?.id;
                walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.FAILED;
                paymentRequest.paymentStatus = PaymentStatus.FAILED;
                return entityManager.save(paymentRequest)
                  .then(_ => {
                    return entityManager
                      .save(walletWithdrawal);
                  });
              });

          }).then(_ => Promise.resolve(walletWithdrawal));

        });


    });
  }

  validatePayment(confirmPaymentDto: ConfirmPaymentDto) {
    return this.connection
      .getCustomRepository(PaymentRequestRepository)
      .findByReference(confirmPaymentDto.reference).then(pRequest => {
        if (!pRequest) {
          throw  new NotFoundException(`Payment reference with reference ${confirmPaymentDto.reference} cannot be found`);
        }
        pRequest.merchantReference = confirmPaymentDto.merchantReference;

        if (PaymentStatus.PAID !== pRequest.paymentStatus) {
          return this.confirmPayment(pRequest, confirmPaymentDto.merchantReference);
        }
        return Promise.resolve(pRequest);

      });
  }

  /**
   * This will confirm if the payment was truly made,
   * the confirmation is done by the payment gateway.
   * @param paymentRequest
   * @param merchantReference
   */
  confirmPayment(paymentRequest: PaymentRequest, merchantReference: string) {
    return this.connection.transaction(entityManager => {
      const datePaid = new Date();
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
          paymentRequest.datePaid = datePaid;
          return entityManager.save(paymentRequest)
            .then(paymentRequest => {
              return this.paymentTransactionService
                .createPaymentTransaction(entityManager, paymentRequest, response, datePaid)
                .then(_ => {
                  return this.invoiceService.updateInvoice(entityManager, paymentRequest, datePaid)
                    .then(_ => {
                      return Promise.resolve(paymentRequest);
                    });
                });
            });
        });
    });
  }


  initiate(invoice: Invoice) {
    if (invoice.paymentStatus === PaymentStatus.PAID) {
      throw new IllegalArgumentException('Invoice has already been paid for');
    }
    return this.connection.getCustomRepository(AssociationRepository).findOne({
      id: invoice.associationId,
    }).then(association => {
      const paymentRequest = PaymentRequestService.buildPaymentRequestFromInvoice(invoice, association);
      return this.paymentRequestSequence.next().then(seq => {
        paymentRequest.reference = seq;
        return paymentRequest.save();
      }).then(paymentRequest => {
        return this.connection.getCustomRepository(PortalUserRepository)
          .findByMembershipId(invoice.createdById)
          .then(user => {
            const transactionParameter = PaymentRequestService.makePaymentInitiationData(paymentRequest, user);
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
            const paymentResponse = PaymentRequestService.buildPaymentRequestResponse(paymentRequest, response);
            return Promise.resolve(paymentResponse);
          });
      });
    });

  }


  private static makePaymentInitiationData(paymentRequest: PaymentRequest, user: PortalUser) {
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

  private static buildPaymentRequestResponse(paymentRequest: PaymentRequest, response: InitiateTransactionResponse) {
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

  private static buildPaymentRequestFromInvoice(invoice: Invoice, association: Association) {
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

  private buildPaymentRequestFromWalletWithdrawal(walletWithdrawal: WalletWithdrawal, wallet: Wallet) {
    return this.connection.getCustomRepository(AssociationRepository)
      .findOne({ id: wallet.associationId })
      .then(association => {
        return this.paymentRequestSequence.next().then(ref => {
          const paymentRequest = new PaymentRequest();
          paymentRequest.amountInMinorUnit = walletWithdrawal.amountInMinorUnit;
          paymentRequest.description = `Payment Request to withdraw from wallet`;
          paymentRequest.walletWithdrawal = walletWithdrawal;
          paymentRequest.association = association;
          paymentRequest.paymentProvider = PaymentProvider.FLUTTER_WAVE;
          paymentRequest.paymentStatus = PaymentStatus.PENDING;
          paymentRequest.paymentType = PaymentType.DEBIT;
          paymentRequest.reference = ref;
          return paymentRequest;
        });
      });


  }
}
