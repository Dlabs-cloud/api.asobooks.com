import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import * as request from 'supertest';
import { Wallet } from '../domain/entity/wallet.entity';
import { WalletWithdrawalEnum } from '../domain/enums/wallet.withdrawal.enum';


describe('Wallet withdrawal controller', () => {
    let applicationContext: INestApplication;
    let connection: Connection;
    let associationUser;


    beforeAll(async () => {
      const moduleRef: TestingModule = await baseTestingModule().compile();
      applicationContext = moduleRef.createNestApplication();
      applicationContext.useGlobalPipes(new ValidatorTransformPipe());
      await applicationContext.init();

      associationUser = await getAssociationUser();
      connection = getConnection();
    });

    it('Get a withdrawal by reference', () => {
      return getAssociationUser().then(testUser => {
        return factory().upset(Wallet).use(wallet => {
          wallet.association = testUser.association;
          return wallet;
        }).create().then(wallet => {
          return factory().upset(WalletWithdrawal).use(walletWithdrawal => {
            walletWithdrawal.wallet = wallet;
            walletWithdrawal.withdrawalStatus = WalletWithdrawalEnum.WAITING_CONFIRMATION;
            return walletWithdrawal;
          }).create().then(walletWithdrawal => {
            return request(applicationContext.getHttpServer())
              .get(`/withdrawals/${walletWithdrawal.reference}`)
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .expect(200)
              .then(response => {
                const data = response.body.data;
                expect(data);
              });
          });
        });
      });

    });


    afterAll(async () => {
      await connection.close();
      await applicationContext.close();
    });
  },
);
