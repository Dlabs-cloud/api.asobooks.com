import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser, mockPaymentTransactions } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection, IsNull, MoreThanOrEqual, Not } from 'typeorm';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as request from 'supertest';
import { Wallet } from '../domain/entity/wallet.entity';
import { Bill } from '../domain/entity/bill.entity';
import { BillRepository } from '../dao/bill.repository';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';

describe('Dashboard', () => {

  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();
  });


  it('test that contribution graph can be viewed on the dash', async () => {
    const association = await factory().create(Association);
    return connection.getCustomRepository(BillRepository).delete({
      id: Not(IsNull()),
    }).then(() => {
      return factory().upset(PortalAccount).use(portalAccount => {
        portalAccount.association = association;
        portalAccount.type = PortalAccountTypeConstant.MEMBER_ACCOUNT;
        return portalAccount;
      }).create().then(portalAccount => {
        return factory().upset(Membership).use(membership => {
          membership.portalAccount = portalAccount;
          return membership;
        }).create().then(membership => {
          return factory().upset(Bill).use(bill => {
            bill.totalAmountPaidInMinorUnit = 7000_00;
            bill.membership = membership;
            bill.datePaid = new Date(1999, 5, 25);
            return bill;
          }).createMany(2).then(() => {
            return factory().upset(Bill).use(bill => {
              bill.totalAmountPaidInMinorUnit = 5000_00;
              bill.membership = membership;
              bill.datePaid = new Date();
              return bill;
            }).createMany(2).then(() => {
              return getAssociationUser(GenericStatusConstant.ACTIVE, null, association)
                .then(testUser => {
                  return request(applicationContext.getHttpServer())
                    .get('/dashboard/contribution-graph?year=1999')
                    .set('Authorization', testUser.token)
                    .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
                    .expect(200).then(response => {
                      const data = response.body.data;
                      expect(data.monthlyContribution).toBeDefined();
                      expect(parseInt(data.yearAmountInMinorUnit.toString())).toEqual(1000000);
                      expect(parseInt(data.monthAmountInMinorUnit.toString())).toEqual(1000000);
                      const indexFive = data.monthlyContribution[5];
                      expect(parseInt(indexFive.amountInMinorUnit.toString())).toEqual(14000_00);
                      expect(parseInt(indexFive.month.toString())).toEqual(5);
                    });
                });

            });

          });
        });
      });
    });
  });


  it('Test that dashboard data can be viewed', async () => {
    jest.setTimeout(12000);
    await connection.getCustomRepository(PaymentTransactionRepository).delete({
      id: MoreThanOrEqual(1),
    });
    const association = await factory().create(Association);

    await factory().upset(Wallet).use(wallet => {
      wallet.association = association;
      wallet.availableBalanceInMinorUnits = 2_000_000_00;
      return wallet;
    }).create();

    return getAssociationUser(GenericStatusConstant.ACTIVE, null, association, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
      .then(testUser => {
        return mockPaymentTransactions(association)
          .then(() => {
            const url = '/dashboard';
            return request(applicationContext.getHttpServer())
              .get(url)
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .expect(200).then(response => {
                const data = response.body.data;
                expect(data.numberOfMembers).toEqual(11);
                expect(parseInt(data.totalExpectedDueInMinorUnit.toString())).toEqual(4500000);
                expect(parseInt(data.totalAmountReceivedInMinorUnit.toString())).toEqual(2500000);
                expect(parseInt(data.walletBalanceInMinorUnit.toString())).toEqual(200000000);
                expect(data);
              });
          });

      });
  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

});

