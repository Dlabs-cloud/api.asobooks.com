import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { getConnection } from 'typeorm';
import { ServiceModule } from '../service/service.module';
import { AuthenticationService } from '../service/authentication.service';
import * as request from 'supertest';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import * as faker from 'faker';
import { factory } from './factory';
import { Country } from '../domain/entity/country.entity';
import { UserManagementService } from '../service/user-management.service';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { GroupRepository } from '../dao/group.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { MembershipRepository } from '../dao/membership.repository';

describe('Membership-management-controller ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let associationUser;
  let userManagementService: UserManagementService;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
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

  it('Test that when a member is created he is added to the association general group', async () => {
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
      .post(`/membership-management/create`)
      .send(membershipSignUpDto)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(201);
    let membership = await connection
      .getCustomRepository(MembershipRepository)
      .findOneItemByStatus({ code: response.body.data.code });

    let membershipGroups = await connection
      .getCustomRepository(GroupRepository)
      .findByAssociationAndMembershipAndType(associationUser.association, membership, GroupTypeConstant.GENERAL);

    expect(1).toEqual(membershipGroups.length);

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

  it('test that association user can get all is association members ', async () => {
    let totalExistingValue = await connection.getCustomRepository(PortalUserRepository).countByAssociationAndAccountType(associationUser.association, PortalAccountTypeConstant.MEMBER_ACCOUNT);
    let response = await request(applicationContext.getHttpServer())
      .get(`/membership-management`)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(200);

    let responseData = response.body.data;
    expect(responseData.total).toEqual(totalExistingValue);

  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
