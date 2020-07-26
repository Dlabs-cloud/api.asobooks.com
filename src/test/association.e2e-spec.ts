import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { AuthenticationService } from '../service/authentication.service';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TestingModule } from '@nestjs/testing';
import { ServiceModule } from '../service/service.module';
import { baseTestingModule, getLoginUser } from './test-utils';
import { getConnection } from 'typeorm';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import * as request from 'supertest';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import * as faker from 'faker';
import { factory } from './factory';
import { Country } from '../domain/entity/country.entity';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

describe('AssociationController', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let loginToken: string;
  let emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();

    connection = getConnection();
    authenticationService = applicationContext
      .select(ServiceModule)
      .get(AuthenticationService, { strict: true });
    emailValidationService = applicationContext.select(ServiceModule).get('EMAIL_VALIDATION_SERVICE', { strict: true });


  });


  it('Test that a login user should be able continue updating his association', async () => {
    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.PENDING_ACTIVATION;
      return association;
    }).create();
    loginToken = await getLoginUser(null, null, association);
    let payload: AssociationRequestDto = {
      activateAssociation: false,
      address: {
        address: faker.address.streetAddress(),
        countryCode: (await factory().create(Country)).code,
      },
      bankInfo: {
        accountNumber: faker.finance.iban(),
        bankCode: (await factory().create(Country)).code,
      },
      name: faker.name.lastName() + 'association',
      type: faker.random.arrayElement(Object.values(AssociationTypeConstant)),
    };

    let response = await request(applicationContext.getHttpServer())
      .put('/association/onboard')
      .set('Authorization', loginToken)
      .send(payload);
    expect(response.status).toEqual(201);
  });
  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
