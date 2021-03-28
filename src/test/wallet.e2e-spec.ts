import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import * as faker from 'faker';
import { factory } from './factory';
import * as request from 'supertest';
import { Wallet } from '../domain/entity/wallet.entity';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { WalletWithdrawalDto } from '../dto/wallet-withdrawal.dto';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

describe('Wallet controller', () => {
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


    it('test that user can initiate a waller withdrawal', () => {
      const password = faker.random.uuid();
      const payload: WalletWithdrawalDto = {
        amountInMinorUnit: 1_00_0,
        password,
      };
      return (new AuthenticationUtils()).hashPassword(password).then(hash => {
        return factory().upset(PortalUser).use(portalUser => {
          portalUser.password = hash;
          return portalUser;
        }).create();
      }).then(portalUser => {
        return getAssociationUser(GenericStatusConstant.ACTIVE, portalUser).then(testUser => {
          return factory().upset(Wallet).use(wallet => {
            wallet.association = testUser.association;
            wallet.availableBalanceInMinorUnits = 1_000_000;
            return wallet;
          }).create().then(_ => {
            return request(applicationContext.getHttpServer())
              .post('/wallets')
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .send(payload)
              .expect(201)
              .then(response => {
                const data = response.body.data;
                expect(data.reference).toBeDefined();
              });
          });
        });
      });
    });

    it('Test that amount less than the wallet amount cannot be withdrawn', () => {
      const password = faker.random.uuid();
      const payload: WalletWithdrawalDto = {
        amountInMinorUnit: 500,
        password,
      };
      return (new AuthenticationUtils()).hashPassword(password).then(hash => {
        return factory().upset(PortalUser).use(portalUser => {
          portalUser.password = hash;
          return portalUser;
        }).create();
      }).then(portalUser => {
        return getAssociationUser(GenericStatusConstant.ACTIVE, portalUser).then(testUser => {
          return factory().upset(Wallet).use(wallet => {
            wallet.association = testUser.association;
            wallet.availableBalanceInMinorUnits = 1_000;
            return wallet;
          }).create().then(_ => {
            return request(applicationContext.getHttpServer())
              .post('/wallets')
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .send(payload)
              .expect(403)
          });
        });
      });
    });

    it('Test that wallet details can be gotten', () => {
      return getAssociationUser().then(testUser => {
        return factory().upset(Wallet).use(wallet => {
          wallet.availableBalanceInMinorUnits = 10_000_000;
          wallet.association = testUser.association;
          return wallet;
        }).create().then(wallet => {
          return factory().upset(WalletTransaction).use(wTransaction => {
            wTransaction.wallet = wallet;
            wTransaction.walletBalance = 5_000_000;
            return wTransaction;
          }).create().then(_ => {
            return request(applicationContext.getHttpServer())
              .get('/wallets')
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .expect(200)
              .then(response => {
                const data = response.body.data;
                expect(+data.amountThisMonthInMinorUnit).toEqual(5_000_000);
                expect(+data.balanceInMinorUnit).toEqual(+wallet.availableBalanceInMinorUnits);
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
