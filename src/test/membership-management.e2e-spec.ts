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
import { Association } from '../domain/entity/association.entity';
import { Membership } from '../domain/entity/membership.entity';
import { AssociationService } from '../service/association.service';
import { UserManagementService } from '../service/user-management.service';

describe('Membership-management-controller ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let associationUser;
  let userManagementService: UserManagementService;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();
    connection = getConnection();

    authenticationService = applicationContext
      .select(ServiceModule)
      .get(AuthenticationService, { strict: true });

    userManagementService = applicationContext
      .select(ServiceModule)
      .get(UserManagementService, { strict: true });


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
    return request(applicationContext.getHttpServer())
      .post(`/membership-management/create`)
      .send(membershipSignUpDto)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(201);
  });

  it('Test that admin cannot create multiple members with same email', async () => {
    let membershipSignUp: MemberSignUpDto = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),
    };
    await userManagementService.createAssociationMember(membershipSignUp, associationUser.association);
    return request(applicationContext.getHttpServer())
      .post(`/membership-management/create`)
      .send(membershipSignUp)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(400);

  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
