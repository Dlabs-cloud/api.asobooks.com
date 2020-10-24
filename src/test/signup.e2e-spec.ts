import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { AuthenticationService } from '../service-impl/authentication.service';
import { ServiceImplModule } from '../service-impl/serviceImplModule';
import { baseTestingModule, getTestUser, mockNewSignUpUser, PRINCIPAL_USER_REQUEST_DATA } from './test-utils';
import * as faker from 'faker';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { AssociationRepository } from '../dao/association.repository';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { MembershipRepository } from '../dao/membership.repository';
import { ServiceModule } from '../service/service.module';

describe('SignUp ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser;
  let emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
    authenticationService = applicationContext
      .select(ServiceImplModule)
      .get(AuthenticationService, { strict: true });
    emailValidationService = applicationContext.select(ServiceModule).get('EMAIL_VALIDATION_SERVICE', { strict: true });

    signedUpUser = await mockNewSignUpUser(authenticationService);

  });

  it('Test sign up route can sign up a user', async () => {

    let test = request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(PRINCIPAL_USER_REQUEST_DATA);

    await test.expect(201);
  });

  it('Test that a principal user can create a pending activated  user, portal, association entities', async () => {
    const requestPayLoad = {
      associationName: faker.name.firstName() + ' Association',
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alphaNumeric() + faker.random.uuid(),
      phoneNumber: faker.phone.phoneNumber(),
      associationType: AssociationTypeConstant.COOPERATIVE,
    };
    await request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(requestPayLoad).expect(201);
    const portalUser = await connection.getCustomRepository(PortalUserRepository).findOneItemByStatus({ username: requestPayLoad.email.toLowerCase() }, GenericStatusConstant.PENDING_ACTIVATION);
    expect(portalUser).toBeDefined();
    expect(portalUser.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);
    const portalAccount = await connection.getCustomRepository(PortalAccountRepository).findFirstByPortalUserAndStatus(portalUser, false, GenericStatusConstant.PENDING_ACTIVATION);
    expect(portalUser).toBeDefined();
    expect(portalAccount.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);
    const membership = await connection.getCustomRepository(MembershipRepository).findByPortalAccountAndPortalUser(portalUser, portalAccount, GenericStatusConstant.PENDING_ACTIVATION);
    expect(membership).toBeDefined();
    expect(membership.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);
    let association = await connection.getCustomRepository(AssociationRepository).findByMembership(membership, GenericStatusConstant.PENDING_ACTIVATION);
    expect(association).toBeDefined();
    expect(association.status).toEqual(GenericStatusConstant.PENDING_ACTIVATION);

  });

  it('Test that principal user with an email that has not been been deleted cannot sign up', async () => {

    await request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(signedUpUser)
      .expect(400);
  });

  it('test that a principal user can activate is account using the token sent to email', async () => {
    const testUser = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const token = await emailValidationService.createCallBackToken(testUser.membership.portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, testUser.membership.portalAccount);
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(200);
  });

  it('test that portalUser Account and users are active after principal validates signup', async () => {
    const testUser = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    let membership = testUser.membership;
    const token = await emailValidationService.createCallBackToken(membership.portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, membership.portalAccount);
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(200);
    const portalUser = await connection.getCustomRepository(PortalUserRepository).findOneItemByStatus({ id: membership.portalUser.id });
    expect(portalUser.status).toEqual(GenericStatusConstant.ACTIVE);
    const portalAccount = await connection.getCustomRepository(PortalAccountRepository).findOneItemByStatus({ id: membership.portalAccount.id });
    expect(portalAccount.status).toEqual(GenericStatusConstant.ACTIVE);
    let mBership = await connection.getCustomRepository(MembershipRepository).findByPortalAccountAndPortalUser(membership.portalUser, membership.portalAccount, GenericStatusConstant.ACTIVE);
    expect(mBership.status).toEqual(GenericStatusConstant.ACTIVE);
    let association = await connection.getCustomRepository(AssociationRepository).findByMembership(mBership, GenericStatusConstant.PENDING_ACTIVATION);
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
