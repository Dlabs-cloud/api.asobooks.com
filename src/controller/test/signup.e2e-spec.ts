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
import { mockNewSignUpUser, mockSendEmail } from './test-utils';
import { SignUpDto } from '../../dto/auth/request/sign-up.dto';
import * as faker from 'faker';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';

describe('AuthController', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser;


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


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
