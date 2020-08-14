import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser, mockNewSignUpUser } from './test-utils';
import { getConnection } from 'typeorm';
import { SettingRepository } from '../dao/setting.repository';
import { ServiceModule } from '../service/service.module';
import { AuthenticationService } from '../service/authentication.service';
import * as request from 'supertest';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import * as faker from 'faker';
import { AssociationAddressRequestDto } from '../dto/association/association-address-request.dto';
import { factory } from './factory';
import { Country } from '../domain/entity/country.entity';

describe('User-management-controller ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser;
  let associationUser;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();
    connection = getConnection();

    authenticationService = applicationContext
      .select(ServiceModule)
      .get(AuthenticationService, { strict: true });


    signedUpUser = await mockNewSignUpUser(authenticationService);

    associationUser = await getAssociationUser();

  });

  it('Test that an admin can create a member for his association', async () => {
    let membershipSignUpDto: MemberSignUpDto = {
      address: {
        address: faker.address.streetAddress(),
        countryCode: (await factory().create(Country)).code,
      },
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),

    };
    let response = await request(applicationContext.getHttpServer())
      .post(`/user-management/create-member`)
      .send(membershipSignUpDto)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.associationCode)
      .expect(201);
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
