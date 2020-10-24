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

describe('Service fees set up test ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
  });

  it('test that service-impl fee can be created with recipients', async () => {

    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();

    let assoUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
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
      .post('/service-impl-fees')
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
    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();
    let associationUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);

    let response = await request(applicationContext.getHttpServer())
      .post('/service-impl-fees')
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .send(requestPayload);
    expect(response.status).toEqual(201);
    expect(response.body.data.code).toBeDefined();
  });

  it('test that a service-impl fee can be gotten by code', async () => {
    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();
    let associationUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
    let serviceFee = await factory().upset(ServiceFee).use((serviceFee) => {
      serviceFee.association = association;
      return serviceFee;
    }).create();

    let response = await request(applicationContext.getHttpServer())
      .get(`/service-fees/${serviceFee.code}`)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code);
    expect(response.status).toEqual(200);
    let data = response.body.data;
    expect(data.status).toEqual(GenericStatusConstant.ACTIVE);
    expect(data.name).toEqual(serviceFee.name);
    expect(data.code).toEqual(serviceFee.code);
    expect(data.amountInMinorUnit).toStrictEqual(serviceFee.amountInMinorUnit.toString());
    expect(data.description).toEqual(serviceFee.description);
    expect(data.billingStartDate).toBeDefined();
  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});