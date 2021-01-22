import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { Invoice } from '../domain/entity/invoice.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as request from 'supertest';
import { Wallet } from '../domain/entity/wallet.entity';
import { ActivityLogEntity } from '../domain/entity/activity-log.entity';

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


  it('Test that dashboard data can be viewed', async () => {
    const association = await factory().create(Association);

    await factory().upset(Wallet).use(wallet => {
      wallet.association = association;
      wallet.availableBalanceInMinorUnits = 2_000_000_00;
      return wallet;
    }).create();

    const memberships = await factory().upset(PortalAccount).use(portalAccount => {
      portalAccount.association = association;
      portalAccount.type = PortalAccountTypeConstant.MEMBER_ACCOUNT;
      return portalAccount;
    }).create().then(portalAccount => {
      return factory().upset(Membership).use(membership => {
        membership.portalAccount = portalAccount;
        return membership;
      }).createMany(10);
    });

    const invoicePromises = memberships.map(membership => {
      return factory().upset(Invoice).use(invoice => {
        invoice.association = association;
        invoice.createdBy = membership;
        return invoice;
      }).create();
    });

    const invoices: Invoice[] = await Promise.all(invoicePromises);

    const paymentRequestPromises = invoices.map(invoice => {
      return factory().upset(PaymentRequest).use(paymentRequest => {
        paymentRequest.association = association;
        paymentRequest.invoice = invoice;
        return paymentRequest;
      }).create();
    });
    const paymentRequests = await Promise.all(paymentRequestPromises);
    const paymentTransactionPromises = paymentRequests.map(paymentRequest => {
      return factory().upset(PaymentTransaction).use(paymentTransaction => {
        paymentTransaction.paymentRequest = paymentRequest;
        return paymentTransaction;
      }).create();
    });

    await Promise.all(paymentTransactionPromises);

    return getAssociationUser(GenericStatusConstant.ACTIVE, null, association)
      .then(testUser => {
        const url = '/dashboard';
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', testUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
          .expect(200).then(response => {
            console.log(response.body);
          });
      });
  });


  it('Test that recent activities can be gotten', async () => {
    const url = '/activities';
    return getAssociationUser().then(assoUser => {
      return factory().upset(ActivityLogEntity).use(activityLog => {
        activityLog.association = assoUser.association;
        return activityLog;
      }).createMany(7).then(activityLogs => {
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', assoUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
          .expect(200).then(response => {
            const data = response.body.data;
            expect(data.itemsPerPage).toEqual(20);
            expect(data.offset).toEqual(0);
            expect(data.total).toEqual(7);
            const items = data.items;
            const item = items[0];
            expect(item.date).toBeDefined();
            expect(item.description).toBeDefined();
            expect(item.type).toBeDefined();
          });
      });
    });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

});

