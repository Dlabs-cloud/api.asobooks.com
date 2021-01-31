import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { Association } from '../domain/entity/association.entity';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser, mockPaymentTransactions } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as request from 'supertest';
import * as moment from 'moment';
import { PaymentTransactionSearchQueryDto } from '../dto/payment-transaction-search.query.dto';

describe('Payment Transactions', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let association: Association;
  let assoUser;

  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();
    association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();

    assoUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
  });


  it('Test that payment transaction can be gotten', async () => {
    jest.setTimeout(12000);
    await mockPaymentTransactions(association);
    const url = `/payment-transactions`;
    return request(applicationContext.getHttpServer())
      .get(url)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .expect(200).then(respnse => {
        const body = respnse.body;
        expect(parseInt(body.itemsPerPage.toString())).toEqual(20);
        expect(parseInt(body.total.toString())).toEqual(10);
      });

  });

  it('Test that a payment transaction can be gotten by query', async () => {
    jest.setTimeout(12000);
    await mockPaymentTransactions(association);
    const url = `/payment-transactions?limit=${5}&offset=${0}&minAmountInMinorUnit=${45_000_00}&maxAmountInMinorUnit=${50_000_00}&dateCreatedBefore=${moment(new Date()).format('DD/MM/YYYY')}&dateCreatedAfter=${moment(new Date()).format('DD/MM/YYYY')}`;
    let response = await request(applicationContext.getHttpServer())
      .get(url)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code);


    const data = response.body.items[0];
    expect(parseInt(response.body.itemsPerPage.toString())).toEqual(5);
    expect(parseInt(response.body.total.toString())).toEqual(10);
    expect(data.paidByFirstName).toBeDefined();
    expect(data.paidByLastLastName).toBeDefined();
    expect(data.amountInMinorUnit).toBeDefined();
    expect(data.membershipReference).toBeDefined();
    expect(data.transactionReference).toBeDefined();
    expect(data.paymentDate).toBeDefined();
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

});