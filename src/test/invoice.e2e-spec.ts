import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser, getTestUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Bill } from '../domain/entity/bill.entity';
import { InvoiceRequestDto } from '../dto/invoice.request.dto';
import * as request from 'supertest';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as faker from 'faker';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentProvider } from '../domain/enums/payment-provider.enum';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { FLUTTERWAVETRANSACTION, PaymentModule, PaymentTransaction } from '@dlabs/payment';
import { InitiateTransactionResponse } from '@dlabs/payment/dto/initiate-transaction.response';

describe('invoice', () => {

  let applicationContext: INestApplication;
  let connection: Connection;
  let paymentTransaction: PaymentTransaction;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();

    paymentTransaction = applicationContext
      .select(PaymentModule)
      .get(FLUTTERWAVETRANSACTION, { strict: false });
  });


  it('Test that invoice that do not exist cannot be found', async () => {
    const data: InvoiceRequestDto = {
      billCodes: [faker.random.alphaNumeric(), faker.random.alphaNumeric()],
    };
    return getAssociationUser().then(user => {
      return request(applicationContext.getHttpServer())
        .post(`/invoice`)
        .send(data)
        .set('Authorization', user.token)
        .set('X-ASSOCIATION-IDENTIFIER', user.association.code)
        .expect(400);
    });
  });


  it('Test that an invoice can be can be used to make payment', async () => {
    const paymentInitiationResponse: InitiateTransactionResponse = {
      merchantReference: null,
      paymentLink: faker.internet.url(),
    };
    const spy = jest.spyOn(paymentTransaction, 'initiate').mockResolvedValue(paymentInitiationResponse);
    let membership = await factory().create(Membership);
    return factory().upset(Invoice).use(invoice => {
      invoice.createdBy = membership;
      invoice.paymentStatus = PaymentStatus.NOT_PAID;
      return invoice;
    }).create().then(invoice => {
      return getAssociationUser(GenericStatusConstant.ACTIVE, membership.portalUser, membership.portalAccount.association)
        .then(associationUser => {
          return request(applicationContext.getHttpServer())
            .get(`/invoice/${invoice.code}/payment-request`)
            .set('Authorization', associationUser.token)
            .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
            .expect(200).then(response => {
              const body = response.body;
              const data = body.data;
              spy.mockRestore();
              expect(parseInt(data.amountInMinorUnit)).toEqual(invoice.payableAmountInMinorUnit);
              expect(data.description).toEqual(`Payment for generated invoice with reference ${invoice.code}`);
              expect(data.paymentLink).toBeDefined();
              expect(data.paymentProvider).toEqual(PaymentProvider.FLUTTER_WAVE);
              expect(data.paymentStatus).toEqual(PaymentStatus.NOT_PAID);
              expect(data.paymentType).toEqual(PaymentType.CREDIT);
              expect(data.reference).toBeDefined();
              expect(parseInt(data.amountPaidInMinorUnit.toString())).toEqual(0);

            });
        });
    });
  });

  it('Test that invoice can be created', async () => {
    let membership = await factory().create(Membership);
    const bills = await factory().upset(Bill).use(bill => {
      bill.membership = membership;
      bill.paymentStatus = PaymentStatus.NOT_PAID;
      return bill;
    }).createMany(3);

    const totalPayableAmount = bills
      .map(bill => bill.payableAmountInMinorUnit)
      .reduce(((pre, curr) => pre + curr));

    const paidBill = await factory().upset(Bill).use(bill => {
      bill.membership = membership;
      bill.paymentStatus = PaymentStatus.PAID;
      return bill;
    }).create();

    bills.push(paidBill);

    const data: InvoiceRequestDto = {
      billCodes: bills.map(bill => bill.code),
    };

    return getAssociationUser(GenericStatusConstant.ACTIVE, membership.portalUser, membership.portalAccount.association)
      .then(associationUser => {
        return request(applicationContext.getHttpServer())
          .post(`/invoice`)
          .send(data)
          .set('Authorization', associationUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
          .expect(201).then(response => {
            const data = response.body.data;
            expect(data.amount).toEqual(totalPayableAmount);
            expect(data.payableAmount).toBeDefined();
            expect(data.surcharge).toBeDefined();
            expect(data.surcharge).toEqual(data.payableAmount - data.amount);
          });
      });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});