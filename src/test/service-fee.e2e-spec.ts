import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import * as faker from 'faker';
import * as moment from 'moment';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import * as request from 'supertest';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { ServiceFeeRepository } from '../dao/service-fee.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Subscription } from '../domain/entity/subcription.entity';
import { Bill } from '../domain/entity/bill.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

describe('Service fees set up test ', () => {
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

  it('test that service fee can be created with recipients', async () => {

    let awaitAssoUsers = [0, 1, 2, 3].map(number => {
      return getAssociationUser(GenericStatusConstant.ACTIVE, null, association, PortalAccountTypeConstant.MEMBER_ACCOUNT);
    });

    let usersIds = (await Promise.all(awaitAssoUsers)).map(assoUser => assoUser.user.membership.portalUser.id);


    let requestPayload: ServiceFeeRequestDto = {
      amountInMinorUnit: 10_000_00,
      cycle: BillingCycleConstant.MONTHLY,
      description: faker.random.words(10),
      billingStartDate: moment(faker.date.future()).format('DD/MM/YYYY'),
      name: faker.random.words(2),
      type: faker.random.arrayElement(Object.values(ServiceTypeConstant)),
      recipients: usersIds,
    };

    let response = await request(applicationContext.getHttpServer())
      .post('/service-fees')
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .send(requestPayload);

    expect(response.status).toEqual(201);
    let serviceCode = response.body.data.code;
    let serviceFee = await connection.getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(serviceCode, association);

    let portalUsersCount = await connection
      .getCustomRepository(PortalUserRepository)
      .countByServiceFeeAndStatus(serviceFee);

    expect(portalUsersCount).toEqual(4);


  });


  it('test that set up fee can be created', async () => {
    let requestPayload: ServiceFeeRequestDto = {
      amountInMinorUnit: 1000000,
      cycle: BillingCycleConstant.MONTHLY,
      description: faker.random.words(10),
      billingStartDate: moment(faker.date.future()).format('DD/MM/YYYY'),
      name: faker.random.words(2),
      type: faker.random.arrayElement(Object.values(ServiceTypeConstant)),
    };


    let response = await request(applicationContext.getHttpServer())
      .post('/service-fees')
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .send(requestPayload);
    expect(response.status).toEqual(201);
    expect(response.body.data.code).toBeDefined();
  });

  it('test that a service fee can be gotten by code', async () => {
    let serviceFee = await factory().upset(ServiceFee).use((serviceFee) => {
      serviceFee.association = association;
      return serviceFee;
    }).create();

    let response = await request(applicationContext.getHttpServer())
      .get(`/service-fees/${serviceFee.code}`)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code);
    expect(response.status).toEqual(200);
    let data = response.body.data;
    expect(data.status).toEqual(GenericStatusConstant.ACTIVE);
    expect(data.name).toEqual(serviceFee.name);
    expect(data.code).toEqual(serviceFee.code);
    expect(data.amountInMinorUnit).toStrictEqual(serviceFee.amountInMinorUnit.toString());
    expect(data.description).toEqual(serviceFee.description);
    expect(data.billingStartDate).toBeDefined();
  });


  it('test that a a services subscriptions summary can be gotten by code', async () => {
    jest.setTimeout(9000);
    let serviceFee = await factory().upset(ServiceFee).use((serviceFee) => {
      serviceFee.association = association;
      return serviceFee;
    }).create();

    const subscriptions = await factory().upset(Subscription)
      .use(subscription => {
        subscription.serviceFee = serviceFee;
        return subscription;
      }).createMany(3);

    const billsPromise: Promise<Bill[]>[] = subscriptions.map(subscription => {
      return factory().upset(Bill).use(bill => {
        bill.subscription = subscription;
        bill.paymentStatus = PaymentStatus.PAID;
        bill.payableAmountInMinorUnit = 2000_00;
        bill.totalAmountPaidInMinorUnit = 2000_00;
        return bill;
      }).createMany(2);
    });
    await Promise.all(billsPromise);

    return request(applicationContext.getHttpServer())
      .get(`/service-fees/${serviceFee.code}/subscriptions?limit=2`)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .expect(200)
      .then(response => {
        const data = response.body;
        expect(data.total).toEqual(3);
        expect(data.offset).toEqual(0);
        expect(parseInt(data.itemsPerPage.toString())).toEqual(2);
        expect(data.items.length).toEqual(2);
      });

  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});