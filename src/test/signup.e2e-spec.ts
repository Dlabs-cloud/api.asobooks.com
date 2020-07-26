import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { AuthenticationService } from '../service/authentication.service';
import { ServiceModule } from '../service/service.module';
import { baseTestingModule, getTestUser, mockNewSignUpUser, PRINCIPAL_USER_REQUEST_DATA } from './test-utils';
import * as faker from 'faker';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { PortalUserAccountRepository } from '../dao/portal-user-account.repository';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { AssociationRepository } from '../dao/association.repository';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';

describe('SignUp ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser;
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

    signedUpUser = await mockNewSignUpUser(authenticationService);

  });

  it('Test sign up route can sign up a user', async () => {

    await request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(PRINCIPAL_USER_REQUEST_DATA).expect(201);
  });

  it('Test that a principal user can create a pending activated  user, portal, association entities', async () => {
    const requestPayLoad = {
      associationName: faker.name.firstName() + ' Association',
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alphaNumeric(),
      phoneNumber: faker.phone.phoneNumber(),
      associationType: AssociationTypeConstant.COOPERATIVE,
    };
    await request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(requestPayLoad).expect(201);
    const portalUser = await connection.getCustomRepository(PortalUserRepository).findOneItemByStatus({ username: requestPayLoad.email }, GenericStatusConstant.PENDING_ACTIVATION);
    expect(portalUser).toBeDefined();
    expect(portalUser.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);
    const portalAccount = await connection.getCustomRepository(PortalAccountRepository).findFirstByPortalUserAndStatus(portalUser, false, GenericStatusConstant.PENDING_ACTIVATION);
    expect(portalUser).toBeDefined();
    expect(portalAccount.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);
    const portalUserAccount = await connection.getCustomRepository(PortalUserAccountRepository).findByPortalAccountAndPortalUser(portalUser, portalAccount, GenericStatusConstant.PENDING_ACTIVATION);
    expect(portalUserAccount).toBeDefined();
    expect(portalUserAccount.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);
    let association = await connection.getCustomRepository(AssociationRepository).findByPortalUserAccount(portalUserAccount, GenericStatusConstant.PENDING_ACTIVATION);
    expect(association).toBeDefined();
    expect(association.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);

  });

  it('Test that principal user with an email that has not been been deleted cannot sign up', async () => {

    await request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(signedUpUser).expect(400);
  });

  it('test that a principal user can activate is account using the token sent to email', async () => {
    const portalUserAccount = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const token = await emailValidationService.createCallBackToken(portalUserAccount.portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, portalUserAccount.portalAccount);
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(200);
  });

  it('test that portalUser Account and users are active after principal validates signup', async () => {
    const portalUserAndAccount = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const token = await emailValidationService.createCallBackToken(portalUserAndAccount.portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, portalUserAndAccount.portalAccount);
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(200);
    const portalUser = await connection.getCustomRepository(PortalUserRepository).findOneItemByStatus({ id: portalUserAndAccount.portalUser.id });
    expect(portalUser.status).toEqual(GenericStatusConstant.ACTIVE);
    const portalAccount = await connection.getCustomRepository(PortalAccountRepository).findOneItemByStatus({ id: portalUserAndAccount.portalAccount.id });
    expect(portalAccount.status).toEqual(GenericStatusConstant.ACTIVE);
    let portalUserAccount = await connection.getCustomRepository(PortalUserAccountRepository).findByPortalAccountAndPortalUser(portalUserAndAccount.portalUser, portalUserAndAccount.portalAccount);
    expect(portalUserAccount.status).toEqual(GenericStatusConstant.ACTIVE);
    let association = await connection.getCustomRepository(AssociationRepository).findByPortalUserAccount(portalUserAccount, GenericStatusConstant.PENDING_ACTIVATION);
    expect(association).toBeDefined();
    expect(association.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);

  });

  it('test that a principal user with invalid token cannot validate  sign up', async () => {
    const token = faker.random.uuid();
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(401);
  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
