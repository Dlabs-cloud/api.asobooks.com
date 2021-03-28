import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, generateToken, getTestUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Bill } from '../domain/entity/bill.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as request from 'supertest';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';

describe('membership-bills controller', () => {

  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();

  });


  it('test that a logged in user can get all its bills', async () => {
    const testUser = await getTestUser(GenericStatusConstant.ACTIVE, null, null, PortalAccountTypeConstant.MEMBER_ACCOUNT);
    let membership = testUser.membership;
    await factory().upset(Bill).use(bill => {
      bill.membership = membership;
      bill.paymentStatus = PaymentStatus.NOT_PAID;
      return bill;
    }).createMany(3);


    return generateToken(membership).then(token => {
      return request(applicationContext.getHttpServer())
        .get(`/member-workspace/bills`)
        .set('Authorization', token)
        .set('X-ASSOCIATION-IDENTIFIER', membership.portalAccount.association.code)
        .expect(200).then(response => {
          let data = response.body.data;
          expect(data.total).toBe(3);
          expect(data.items[0]).toHaveProperty('id');
          expect(data.items[0]).toHaveProperty('status');
          expect(data.items[0]).toHaveProperty('createdAt');
          expect(data.items[0]).toHaveProperty('updatedAt');
          expect(data.items[0]).toHaveProperty('code');
          expect(data.items[0]).toHaveProperty('currentAmountInMinorUnit');
          expect(data.items[0]).toHaveProperty('description');
          expect(data.items[0]).toHaveProperty('vatInPercentage');
          expect(data.items[0]).toHaveProperty('disCountInPercentage');
          expect(data.items[0]).toHaveProperty('payableAmountInMinorUnit');
          expect(data.items[0]).toHaveProperty('totalAmountPaidInMinorUnit');
          expect(data.items[0]).toHaveProperty('paymentStatus');
          expect(data.items[0]).toHaveProperty('lastDispatchDate');
          expect(data.items[0].subscription).toBeDefined();
        });
    });

  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

});
