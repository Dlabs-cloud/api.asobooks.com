import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../../app.service';
import { AppModule } from '../../app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthenticationService } from '../../service/authentication.service';
import { ServiceModule } from '../../service/service.module';
import { getTestUser, mockNewSignUpUser, mockSendEmail } from './test-utils';
import { SignUpDto } from '../../dto/auth/request/sign-up.dto';
import * as faker from 'faker';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { IEmailValidationService } from '../../contracts/i-email-validation-service';
import { TokenPayloadDto } from '../../../dist/src/dto/token-payload.dto';
import { TokenTypeConstant } from '../../domain/enums/token-type-constant';
import { PortalUserRepository } from '../../dao/portal-user.repository';

describe('SignUp ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser;
  let emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>;


  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ServiceModule],
      providers: [AppService],
    }).overrideProvider(MailerService)
      .useValue({
        sendMail: mockSendEmail(),
      }).compile();


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
    const signUpRequestDto: SignUpDto = {
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
      .send(signUpRequestDto).expect(201);
  });

  it('Test that user with an email that has not been been deleted cannot sign up', async () => {

    await request(applicationContext.getHttpServer())
      .post('/sign-up')
      .send(signedUpUser).expect(400);
  });

  it('test that a user can activate is account using the token sent to email', async () => {
    const portalUserAccount = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const token = await emailValidationService.createCallBackToken(portalUserAccount.portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, portalUserAccount.portalAccount);
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(200);
  });

  it('test that a user with invalid token cannot sign up', async () => {
    const token = faker.random.uuid();
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(201);
  });

  it('test activating action will make it active', async () => {
    const portalUserAccount1 = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const token = await emailValidationService.createCallBackToken(portalUserAccount1.portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, portalUserAccount1.portalAccount);
    const url = `/validate-principal/${token}`;
    await request(applicationContext.getHttpServer())
      .get(url)
      .send(signedUpUser).expect(200);
    const portalUser = await getConnection().getCustomRepository(PortalUserRepository).findOneItemByStatus({
      id: portalUserAccount1.portalUser.id,
    });
    expect(portalUser.id).toEqual(portalUserAccount1.portalUser.id);


  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
