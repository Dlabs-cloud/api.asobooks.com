import { INestApplication, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { factory } from './factory';
import { Bank } from '../domain/entity/bank.entity';
import * as faker from 'faker';
import { BankVerificationService, FLUTTERWAVEBANKVERIFICATION, PaymentModule } from '@dlabs/payment';
import { BankVerificationResponse } from '@dlabs/payment/dto/bank-verification.response';
import { AccountDetail } from '../domain/entity/account-detail.entity';

describe('verification controller', () => {
    let applicationContext: INestApplication;
    let connection: Connection;
    let associationUser;
    let bankVerificationService: BankVerificationService;


    beforeAll(async () => {

      const moduleRef: TestingModule = await baseTestingModule().compile();
      applicationContext = moduleRef.createNestApplication();
      applicationContext.useGlobalPipes(new ValidatorTransformPipe());
      await applicationContext.init();

      associationUser = await getAssociationUser();
      connection = getConnection();
      bankVerificationService = applicationContext
        .select(PaymentModule)
        .get<BankVerificationService>(FLUTTERWAVEBANKVERIFICATION, { strict: false });
    });


    it('Test that an account can be verified with account number', () => {
      const bankVerification: BankVerificationResponse = {
        accountName: faker.finance.accountName(),
        accountNumber: faker.finance.account(10),
      };
      const verificationSpy = jest
        .spyOn(bankVerificationService, 'verifyAccount')
        .mockResolvedValue(bankVerification);

      return factory().upset(Bank).use(bank => {
        bank.flutterWaveReference = '047';
        bank.name = faker.finance.iban();
        return bank;
      }).create().then(bank => {
        const url = `/verifications/banks/${bank.code}/account/${bankVerification.accountNumber}/verify`;
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', associationUser.token)
          .expect(200).then(response => {
            verificationSpy.mockRestore();
            const data = response.body.data;
            expect(data.bankName).toEqual(bank.name);
            expect(data.accountName).toEqual(bankVerification.accountName);
            expect(data.accountNumber).toEqual(bankVerification.accountNumber);
          });
      });

    });


    it('Test that an account number that does not exist will return a 404', () => {

      const verificationSpy = jest
        .spyOn(bankVerificationService, 'verifyAccount')
        .mockRejectedValue(new NotFoundException('Bank account cannot be found'));
      return factory().upset(Bank).use(bank => {
        bank.flutterWaveReference = '044';
        bank.name = faker.finance.iban();
        return bank;
      }).create().then(bank => {
        const url = `/verifications/banks/${bank.code}/account/${faker.finance.account(10)}/verify`;
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', associationUser.token)
          .expect(404)
          .then(response => {
            const data = response.body;
            verificationSpy.mockRestore();
            expect(data.code).toEqual(404);
            expect(data.message).toEqual(`Bank account cannot be found`);
          });
      });

    });


    it('Test that service time out will return a 504', () => {
      const verificationSpy = jest
        .spyOn(bankVerificationService, 'verifyAccount')
        .mockImplementation((_, __) => {
          throw new ServiceUnavailableException('Payment service is not available');
        });
      return factory().upset(Bank).use(bank => {
        bank.flutterWaveReference = '045';
        bank.name = faker.finance.iban();
        return bank;
      }).create().then(bank => {
        const url = `/verifications/banks/${bank.code}/account/${faker.finance.account(10)}/verify`;
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', associationUser.token)
          .expect(503)
          .then(response => {
            const data = response.body;
            verificationSpy.mockRestore();
            expect(data.code).toEqual(503);
            expect(data.message).toEqual(`Payment service is not available`);
          });
      });
    });


    it('test that account with account details that exists will not call endpoint ', () => {
      return factory()
        .upset(AccountDetail)
        .create()
        .then(accountDetail => {
          const url = `/verifications/banks/${accountDetail.bank.code}/account/${accountDetail.number}/verify`;
          return request(applicationContext.getHttpServer())
            .get(url)
            .set('Authorization', associationUser.token)
            .expect(200).then(response => {
              const data = response.body.data;
              expect(data.bankName).toEqual(accountDetail.bank.name);
              expect(data.accountName).toEqual(accountDetail.name);
              expect(data.accountNumber).toEqual(accountDetail.number);
            });
        });
    });

    afterAll(async () => {
      await connection.close();
      await applicationContext.close();
    });
  },
);
