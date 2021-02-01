import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { getConnection } from 'typeorm';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
import { AuthenticationService } from '../service-impl/authentication.service';
import * as request from 'supertest';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import * as faker from 'faker';
import { factory } from './factory';
import { Country } from '../domain/entity/country.entity';
import { UserManagementService } from '../service-impl/user-management.service';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { GroupRepository } from '../dao/group.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { MembershipRepository } from '../dao/membership.repository';
import { Membership } from '../domain/entity/membership.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { AddressRepository } from '../dao/address.repository';
import { MembershipInfoRepository } from '../dao/membership-info.repository';
import { add } from 'winston';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';

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
      .select(ServiceImplModule)
      .get(AuthenticationService, { strict: true });

    userManagementService = applicationContext
      .select(ServiceImplModule)
      .get(UserManagementService, { strict: true });


    associationUser = await getAssociationUser();

  });

  it('Test that an admin can create a member for his association', async () => {
    let membershipSignUpDto: MemberSignUpDto = {
      address: {
        address: faker.address.streetAddress(),
        countryCode: (await factory().create(Country)).code,
        unit: faker.random.alphaNumeric(),
      },
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),
      identifier: faker.random.alphaNumeric() + faker.random.uuid(),
      types: [PortalAccountTypeConstant.EXECUTIVE_ACCOUNT, PortalAccountTypeConstant.MEMBER_ACCOUNT],
    };
    return request(applicationContext.getHttpServer())
      .post(`/membership-management/create`)
      .send(membershipSignUpDto)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(201)
      .then((response) => {
        return connection.getCustomRepository(PortalUserRepository)
          .findByUserNameOrEmailOrPhoneNumberAndStatus(membershipSignUpDto.email.toLowerCase(), GenericStatusConstant.ACTIVE)
          .then(portalUser => {
            return connection.getCustomRepository(MembershipRepository)
              .findByUserAndAssociation(portalUser, associationUser.association)
              .then(memberships => {
                const membership = memberships[0];
                return connection.getCustomRepository(MembershipInfoRepository)
                  .findOne({ id: membership.membershipInfoId })
                  .then(membershipInfo => {
                    expect(membershipInfo.identifier).toEqual(membershipSignUpDto.identifier);
                    return connection.getCustomRepository(AddressRepository).findOne({ id: membershipInfo.addressId })
                      .then(address => {
                        expect(address.unit).toEqual(membershipSignUpDto.address.unit);
                        expect(address.name).toEqual(membershipSignUpDto.address.address);
                      });
                  });
              });

          });
      });
  });

  it('Test that an when a member is created he his added to the association general group', async () => {
    let membershipSignUpDto: MemberSignUpDto = {
      address: {
        address: faker.address.streetAddress(),
        countryCode: (await factory().create(Country)).code,
      },
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),
      types: [PortalAccountTypeConstant.MEMBER_ACCOUNT, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT],
    };
    await request(applicationContext.getHttpServer())
      .post(`/membership-management/create`)
      .send(membershipSignUpDto)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(201);

    return connection.getCustomRepository(PortalUserRepository)
      .findOne({ email: membershipSignUpDto.email.toLowerCase() })
      .then(portalUser => {
        return connection.getCustomRepository(MembershipRepository).findByUserAndAssociation(portalUser, associationUser.association);
      }).then(memberships => {
        expect(2).toEqual(memberships.length);
        return connection
          .getCustomRepository(GroupRepository)
          .findByAssociationAndMembershipAndType(associationUser.association, memberships[0], GroupTypeConstant.GENERAL);
      }).then(membershipGroups => {
        expect(1).toEqual(membershipGroups.length);
      });

  });

  it('Test that admin cannot create multiple members with same email', async () => {
    let membershipSignUp: MemberSignUpDto = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),
      types: [PortalAccountTypeConstant.MEMBER_ACCOUNT, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT],
    };
    await userManagementService.createAssociationMember(membershipSignUp, associationUser.association, associationUser.portalUser);
    return request(applicationContext.getHttpServer())
      .post(`/membership-management/create`)
      .send(membershipSignUp)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(400);

  });

  it('test that association user can get all is association members ', async () => {
    const membershipInfos = await factory().upset(MembershipInfo).use(membershipInfo => {
      membershipInfo.association = associationUser.association;
      return membershipInfo;
    }).createMany(4);
    const portalAccount = await factory().upset(PortalAccount).use(portalAccount => {
      portalAccount.association = associationUser.association;
      portalAccount.type = PortalAccountTypeConstant.MEMBER_ACCOUNT;
      return portalAccount;
    }).create();

    const membershipsPromise: Promise<Membership[]>[] = membershipInfos.map(membershipInfo => {
      return factory().upset(Membership).use(membership => {
        membership.portalAccount = portalAccount;
        membership.portalUser = membershipInfo.portalUser;
        return membership;
      }).createMany(3);
    });
    await Promise.all(membershipsPromise);


    let totalExistingValue = await connection.getCustomRepository(PortalUserRepository).countByAssociationAndAccountType(associationUser.association, PortalAccountTypeConstant.MEMBER_ACCOUNT);
    let response = await request(applicationContext.getHttpServer())
      .get(`/membership-management?type=${PortalAccountTypeConstant.MEMBER_ACCOUNT}`)
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
      .expect(200);

    let responseData = response.body.data;
    const item = responseData.items[0];
    expect(item.email).toBeDefined();
    expect(item.firstName).toBeDefined();
    expect(item.lastName).toBeDefined();
    expect(item.phoneNumber).toBeDefined();
    expect(item.username).toBeDefined();
    expect(item.id).toBeDefined();
    expect(item.identifier).toBeDefined();
    expect(item.dateCreated).toBeDefined();
    expect(responseData.total).toEqual(totalExistingValue);
    expect(responseData.total).toBeGreaterThan(1);

  });


  it('Test that a member can be deleted', () => {
    return factory().create(PortalUser).then(portalUser => {
      return factory().upset(PortalAccount).use(portalAccount => {
        portalAccount.association = associationUser.association;
        return portalAccount;
      }).create().then(portalAccount => {
        return factory().upset(Membership).use(membership => {
          membership.portalAccount = portalAccount;
          membership.portalUser = portalUser;
          return membership;
        }).create();
      }).then((membership) => {
        return request(applicationContext.getHttpServer())
          .delete(`/membership-management/${portalUser.id}`)
          .set('Authorization', associationUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
          .then(response => {
            expect(response.status).toEqual(200);
            return connection.getCustomRepository(MembershipRepository).findOne({
              id: membership.id,
            }).then(membership => {
              expect(membership.status).toEqual(GenericStatusConstant.DELETED);
            });
          });
      });
    });

  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
})
;
