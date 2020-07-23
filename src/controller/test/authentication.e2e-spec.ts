import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { AuthenticationService } from '../../service/authentication.service';
import { IEmailValidationService } from '../../contracts/i-email-validation-service';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { TokenPayloadDto } from '../../../dist/src/dto/token-payload.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ServiceModule } from '../../service/service.module';
import { AppService } from '../../app.service';
import { MailerService } from '@nestjs-modules/mailer';
import { getTestUser, mockSendEmail } from './test-utils';
import { getConnection } from 'typeorm';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { PortalUserAccount } from '../../domain/entity/portal-user-account.entity';
import * as request from 'supertest';
import { LoginDto } from '../../dto/auth/request/login.dto';
import { factory } from './factory';
import { AuthenticationUtils } from '../../common/utils/authentication-utils.service';
import * as faker from 'faker';
import { PasswordResetDto } from '../../dto/auth/request/password-reset.dto';
import { PortalUserRepository } from '../../dao/portal-user.repository';
import { TokenTypeConstant } from '../../domain/enums/token-type-constant';
import { ChangePasswordDto } from '../../dto/auth/request/change-password.dto';

describe('AuthController', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser: PortalUserAccount;
  let emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>;


  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ServiceModule],
      providers: [AppService],
    }).overrideProvider(MailerService)
      .useValue({
        sendMail: mockSendEmail(),
      })
      .compile();


    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();

    connection = getConnection();
    authenticationService = applicationContext
      .select(ServiceModule)
      .get(AuthenticationService, { strict: true });
    emailValidationService = applicationContext.select(ServiceModule).get('EMAIL_VALIDATION_SERVICE', { strict: true });

    signedUpUser = await getTestUser(GenericStatusConstant.ACTIVE);

  });


  it('test that a user with invalid login details cannot login', async () => {
    const loginData: LoginDto = {
      password: signedUpUser.portalUser.password,
      username: signedUpUser.portalUser.username,
    };
    await request(applicationContext.getHttpServer())
      .post('/login')
      .send(loginData).expect(401);
  });

  it('Test that an active user can reset password', async () => {
    const loginData: LoginDto = {
      password: signedUpUser.portalUser.password,
      username: signedUpUser.portalUser.username,
    };

    await request(applicationContext.getHttpServer())
      .post('/login')
      .send(loginData).expect(401);
  });


  it('Test that an active user can reset password ', async () => {
    const portalUserAccount = await getTestUser(GenericStatusConstant.ACTIVE);
    const payLoad: PasswordResetDto = {
      email: portalUserAccount.portalUser.email,
    };
    await request(applicationContext.getHttpServer())
      .post('/password/reset')
      .send(payLoad).expect(200);
    const portalUser = await connection
      .getCustomRepository(PortalUserRepository)
      .findOne({
        username: portalUserAccount.portalUser.username,
      });

    expect(GenericStatusConstant.IN_ACTIVE).toEqual(portalUser.status);

  });


  it('test that a valid user can login', async () => {
    const password = faker.random.uuid();
    const hashPassword = await (new AuthenticationUtils()).hashPassword(password);
    const portalUser = await factory().upset(PortalUser).use(portalUser => {
      portalUser.password = hashPassword;
      return portalUser;
    }).create();
    await getTestUser(GenericStatusConstant.ACTIVE, portalUser);
    const loginData: LoginDto = {
      password: password,
      username: portalUser.email,

    };
    await request(applicationContext.getHttpServer())
      .post('/login')
      .send(loginData).expect(200);
  });


  it('Test that a user can reset password with valid token', async () => {
    let portalUser = signedUpUser.portalUser;
    portalUser.status = GenericStatusConstant.IN_ACTIVE;
    portalUser = await connection.getCustomRepository(PortalUserRepository).save(portalUser);
    const token = await emailValidationService.createCallBackToken(portalUser, TokenTypeConstant.FORGOT_PASSWORD);
    const url = `/password/reset/${token}`;
    const password = faker.random.uuid();
    const payload: ChangePasswordDto = {
      password: password,
    };

    await request(applicationContext.getHttpServer())
      .post(url)
      .send(payload)
      .expect(200);


    const pUser = await connection.getCustomRepository(PortalUserRepository)
      .findOne({ id: portalUser.id });

    const isPasswordEquals = await new AuthenticationUtils().comparePassword(password, pUser.password);
    expect(isPasswordEquals).toBe(true);
    expect(pUser.status).toEqual(GenericStatusConstant.ACTIVE);

  });

  it('Test that a user with invalid token cannot reset password', async () => {
    const token = faker.random.uuid();
    const url = `/password/reset/${token}`;

    const payload: ChangePasswordDto = {
      password: faker.random.uuid(),
    };

    await request(applicationContext.getHttpServer())
      .post(url)
      .send(payload)
      .expect(401);

  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});