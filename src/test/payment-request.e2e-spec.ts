import { INestApplication, NotFoundException } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PaymentType } from '../domain/enums/payment-type.enum';
import * as request from 'supertest';
import { Association } from '../domain/entity/association.entity';
import { Wallet } from '../domain/entity/wallet.entity';
import { PaymentProvider } from '../domain/enums/payment-provider.enum';
import { WalletRepository } from '../dao/wallet.repository';
import * as faker from 'faker';
import { PaymentTransaction as PaymentTransactionModel } from '../domain/entity/payment-transaction.entity';

import {
  FLUTTERWAVETRANSACTION,
  PaymentModule,
  PaymentTransactionService,
  VerificationResponseDto,
} from '@dlabs/payment';

describe('invoice controller', () => {

  let applicationContext: INestApplication;
  let connection: Connection;
  let testUser;
  let paymentTransaction: PaymentTransactionService;
  let verificationResponseDto: VerificationResponseDto;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();
    testUser = (await getAssociationUser());

    paymentTransaction = applicationContext
      .select(PaymentModule)
      .get(FLUTTERWAVETRANSACTION, { strict: false });

    verificationResponseDto = {
      amountInMinorUnit: 2_000_00,
      currency: 'NGN',
      datePaid: faker.date.future(),
      merchantReference: Date.now() + faker.random.alphaNumeric(),
      narration: faker.random.words(5),
      paidBy: faker.name.firstName() + ' ' + faker.name.lastName(),
      paymentOption: 'card',
      status: 'successful',
      transactionReference: Date.now() + faker.random.alphaNumeric(),
    };
  });

  it('Test that a payment request can be verified', () => {
    const verifySpy = jest.spyOn(paymentTransaction, 'verify',
    ).mockResolvedValue(verificationResponseDto);
    return factory().create(Association).then(association => {
      return factory().upset(Wallet).use(wallet => {
        wallet.association = association;
        wallet.availableBalanceInMinorUnits = 1_000_00;
        return wallet;
      }).create().then((wallet) => {
        return factory().upset(PaymentRequest).use(paymentRequest => {
          paymentRequest.paymentStatus = PaymentStatus.NOT_PAID;
          paymentRequest.paymentType = PaymentType.CREDIT;
          paymentRequest.association = association;
          paymentRequest.paymentProvider = PaymentProvider.FLUTTER_WAVE;
          return paymentRequest;
        }).create().then(paymentRequest => {
          const url = `/payments/confirm?reference=${paymentRequest.reference}&merchantReference=${verificationResponseDto.merchantReference}`;
          return request(applicationContext.getHttpServer())
            .get(url)
            .set('Authorization', testUser.token)
            .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
            .expect(200).then(response => {
              const data = response.body.data;
              return getConnection().getCustomRepository(WalletRepository).findByAssociation(association).then(newWallet => {
                const walletBalance = +wallet.availableBalanceInMinorUnits + +verificationResponseDto.amountInMinorUnit;
                expect(parseInt(newWallet.availableBalanceInMinorUnits.toString())).toEqual(walletBalance);
                return wallet;
              }).then(() => {
                expect(verifySpy).toBeCalled();
                expect(parseInt(data.amountInMinorUnit.toString())).toEqual(paymentRequest.amountInMinorUnit);
                expect(data.description).toEqual(paymentRequest.description);
                expect(data.paymentStatus).toBeDefined();
                expect(data.paymentType).toEqual('CREDIT');
                expect(data.reference).toEqual(paymentRequest.reference);
                expect(data.paymentTransactionId).toBeDefined();
                expect(data.merchantReference).toEqual(verificationResponseDto.merchantReference);
                expect(parseInt(data.amountPaidInMinorUnit.toString())).toEqual(verificationResponseDto.amountInMinorUnit);
                verifySpy.mockRestore();
              });
            });
        });
      });
    });

  });

  it('Test that a paid payment request cannot be repaid', () => {
    return factory().create(Association).then(association => {
      return factory().upset(Wallet).use(wallet => {
        wallet.association = association;
        wallet.availableBalanceInMinorUnits = 1_000_00;
        return wallet;
      }).create().then(wallet => {
        return factory().upset(PaymentRequest).use(paymentRequest => {
          paymentRequest.paymentStatus = PaymentStatus.PAID;
          paymentRequest.paymentType = PaymentType.CREDIT;
          paymentRequest.association = association;
          paymentRequest.amountInMinorUnit = 1_000_00;
          paymentRequest.amountPaidInMinorUnit = 1_000_00;
          paymentRequest.paymentProvider = PaymentProvider.FLUTTER_WAVE;
          return paymentRequest;
        }).create().then(paymentRequest => {
          return factory().upset(PaymentTransactionModel).use(paymentTransaction => {
            paymentTransaction.paymentRequest = paymentRequest;
            return paymentTransaction;
          }).create().then((paymentTransaction) => {
            const url = `/payments/confirm?reference=${paymentRequest.reference}&merchantReference=${paymentRequest.merchantReference}`;
            return request(applicationContext.getHttpServer())
              .get(url)
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .expect(200)
              .then(response => {
                const data = response.body.data;
                expect(parseInt(data.amountInMinorUnit)).toEqual(paymentRequest.amountInMinorUnit);
                expect(data.description).toEqual(paymentRequest.description);
                expect(data.paymentProvider).toEqual(paymentRequest.paymentProvider);
                expect(data.paymentStatus).toEqual(paymentRequest.paymentStatus);
                expect(data.paymentType).toEqual(paymentRequest.paymentType);
                expect(data.reference).toEqual(paymentRequest.reference);
                expect(data.merchantReference).toEqual(paymentRequest.merchantReference);
                expect(data.amountPaidInMinorUnit).toEqual(paymentRequest.amountPaidInMinorUnit);
                expect(data.paymentTransactionId).toEqual(paymentTransaction.id);
              });
          });

        });
      });

    });

  });

  it('Test that verifying a payment with a merchant reference will throw if not found', () => {
    const verificationSpy = jest.spyOn(paymentTransaction, 'verify')
      .mockImplementation((transactionRef: string) => {
        throw new NotFoundException('Payment reference cannot be found');
      });
    return factory().upset(PaymentRequest).use(paymentRequest => {
      return paymentRequest;
    }).create().then(paymentRequest => {
      const url = `/payments/confirm?reference=${paymentRequest.reference}&merchantReference=${paymentRequest.merchantReference}`;
      return request(applicationContext.getHttpServer())
        .get(url)
        .set('Authorization', testUser.token)
        .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
        .expect(404).then(response => {
          verificationSpy.mockRestore();
          const body = response.body;
          expect(body.code).toEqual(404);
          expect(body.message).toEqual('Payment reference cannot be found');
        });
    });

  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

})
;