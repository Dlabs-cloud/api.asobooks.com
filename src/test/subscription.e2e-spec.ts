import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getTestUser } from './test-utils';
import { getConnection } from 'typeorm';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { factory } from './factory';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Bill } from '../domain/entity/bill.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { SubscriptionBillsResponseDto } from '../dto/subscription-bills-response.dto';
import * as moment from 'moment';
import { SubscriptionBillQueryDto } from '../dto/subscription-bill-query.dto';

describe('Test subscription controller', () => {
  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();
    connection = getConnection();
  });


  it('Test that association subscription bill can be gotten by query ', () => {
    return getTestUser(GenericStatusConstant.ACTIVE, null, null, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(testUser => {
        return factory().upset(Bill).use(bill => {
          bill.membership = testUser.membership;
          bill.paymentStatus = PaymentStatus.PAID;
          return bill;
        }).create().then(bill => {
          return factory().upset(BillInvoice).use(billInvoice => {
            billInvoice.bill = bill;
            return billInvoice;
          }).create().then(billInvoice => {
            const invoice = billInvoice.invoice;
            invoice.paymentStatus = PaymentStatus.PAID;
            invoice.association = testUser.association;
            return invoice.save();
          }).then(invoice => {
            return factory().upset(PaymentRequest).use(paymentRequest => {
              paymentRequest.invoice = invoice;
              paymentRequest.association = testUser.association;
              return paymentRequest;
            }).create().then(paymentRequest => {
              return factory().upset(PaymentTransaction).use(paymentTransaction => {
                paymentTransaction.paymentRequest = paymentRequest;
                paymentTransaction.confirmedPaymentDate = new Date();
                return paymentTransaction;
              }).create().then(paymentTransaction => {
                const date = moment(bill.createdAt).format('DD/MM/YYYY');
                const queryParam: SubscriptionBillQueryDto = {
                  limit: 1,
                  name: bill.membership.portalUser.firstName,
                  offset: 0,
                  paymentStatus: bill.paymentStatus,
                  phoneNumber: bill.membership.portalUser.phoneNumber,
                  receiptNumber: paymentTransaction.reference,
                  startDateAfter: date,
                  startDateBefore: date,
                  timeOfPaymentAfter: date,
                  timeOfPaymentBefore: date,
                };
                const queryParams = Object.keys(queryParam).map(key => {
                  return `${key}=${queryParam[key]}`;
                });
                const query = queryParams.join('&');
                const url = `/subscriptions?${query}`;
                console.log(url);
              });
            });
          });
        });
      });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});