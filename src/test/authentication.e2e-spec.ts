import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { AuthenticationService } from '../service-impl/authentication.service';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TestingModule } from '@nestjs/testing';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
import { baseTestingModule, getAssociationUser, getLoginUser, getTestUser } from './test-utils';
import { getConnection } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as request from 'supertest';
import { LoginDto } from '../dto/auth/request/login.dto';
import { factory } from './factory';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import * as faker from 'faker';
import { PasswordResetDto } from '../dto/auth/request/password-reset.dto';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { ChangePasswordDto } from '../dto/auth/request/change-password.dto';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { Association } from '../domain/entity/association.entity';
import { Membership } from '../domain/entity/membership.entity';
import { ServiceModule } from '../service/service.module';
import { MembershipRepository } from '../dao/membership.repository';
import { ProfileUpdateDto } from '../dto/profile-update.dto';
import { CommonModule } from '../common/common.module';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { Role } from '../domain/entity/role.entity';
import { MembershipRole } from '../domain/entity/membership-role.entity';

describe('AuthController', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let authenticationService: AuthenticationService;
  let signedUpUser: Membership;
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

    applicationContext.select(CommonModule).get(AuthenticationUtils);

    emailValidationService = applicationContext.select(ServiceModule).get('EMAIL_VALIDATION_SERVICE', { strict: true });
    let testUser = await getTestUser(GenericStatusConstant.ACTIVE);
    signedUpUser = testUser.membership;

  });


  it('test that a user with invalid login details cannot login', async () => {
    const loginData: LoginDto = {
      password: signedUpUser.portalUser.password,
      username: signedUpUser.portalUser.username,
    };
    return request(applicationContext.getHttpServer())
      .post('/login')
      .send(loginData)
      .expect(401);
  });

  it('That that a pending activation user with be advised to retrieve validation', async () => {
    const password = faker.random.uuid();
    const hashPassword = await (new AuthenticationUtils()).hashPassword(password);
    const portalUser = await factory().upset(PortalUser).use(portalUser => {
      portalUser.password = hashPassword;
      portalUser.status = GenericStatusConstant.PENDING_ACTIVATION;
      return portalUser;
    }).create();
    const loginData: LoginDto = {
      password: password,
      username: portalUser.username,
    };


    return request(applicationContext.getHttpServer())
      .post('/login')
      .send(loginData)
      .expect(406);

  });


  it('Test that an active user can reset password ', async () => {
    const testUser = await getTestUser();
    const payLoad: PasswordResetDto = {
      email: testUser.membership.portalUser.email,
    };
    await request(applicationContext.getHttpServer())
      .post('/password/reset')
      .send(payLoad).expect(200);
    const portalUser = await connection
      .getCustomRepository(PortalUserRepository)
      .findOne({
        username: testUser.membership.portalUser.username,
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

  it('Test that a user can can update information', async () => {
    const existingPassword = faker.random.alphaNumeric(12);
    const payload: ProfileUpdateDto = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: existingPassword,
      newPassword: faker.random.alphaNumeric(10),
    };
    const hashedPassword = await (new AuthenticationUtils()).hashPassword(existingPassword);
    return factory().upset(PortalUser).use(portalUser => {
      portalUser.password = hashedPassword;
      return portalUser;
    }).create().then(user => {
      return getLoginUser(GenericStatusConstant.ACTIVE, user)
        .then(loginUser => {
          return request(applicationContext.getHttpServer())
            .patch('/me')
            .send(payload)
            .set('Authorization', loginUser.token)
            .expect(200)
            .then(response => {
              const data = response.body.data;
              expect(data.firstName).toEqual(payload.firstName);
              expect(data.lastName).toEqual(payload.lastName);
              return connection
                .getCustomRepository(PortalUserRepository)
                .findOne({ id: user.id })
                .then(u => {
                  return (new AuthenticationUtils())
                    .comparePassword(payload.newPassword, u.password)
                    .then(same => {
                      expect(same).toEqual(true);
                    });
                });
            });
        });
    });

  });


  it('test that when a user is logged in he can get me', async () => {
    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.PENDING_ACTIVATION;
      return association;
    }).create();

    let response = await request(applicationContext.getHttpServer())
      .get('/me')
      .set('Authorization', (await getLoginUser(null, null, association)).token);
    let responseData = response.body.data;
    expect(responseData.firstName).toBeDefined();
    expect(responseData.lastName).toBeDefined();
    expect(responseData.username).toBeDefined();
    expect(responseData.email).toBeDefined();
    expect(responseData.phoneNumber).toBeDefined();
    expect(responseData.associations).toBeDefined();
    expect(responseData.associations.length).toEqual(1);
    expect(responseData.associations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.anything(),
          type: expect.anything(),
          code: expect.anything(),
          status: GenericStatusConstant.PENDING_ACTIVATION,
          accounts: expect.arrayContaining([
            expect.objectContaining({
              accountCode: expect.anything(),
              dateUpdated: expect.anything(),
              name: expect.anything(),
              type: expect.anything(),
            }),
          ]),
        }),
      ]),
    );
    expect(response.status).toEqual(200);
  });


  it('Test that when password us reset for a pending account the account becomes active', async () => {
    let testUser = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const token = await emailValidationService.createCallBackToken(testUser.membership.portalUser, TokenTypeConstant.FORGOT_PASSWORD);
    const url = `/password/reset/${token}`;
    const password = faker.random.uuid();
    const payload: ChangePasswordDto = {
      password: password,
    };

    await request(applicationContext.getHttpServer())
      .post(url)
      .send(payload)
      .expect(200);

    let portalUser = await connection.getCustomRepository(PortalUserRepository).findByUserNameOrEmailOrPhoneNumberAndStatus(testUser.membership.portalUser.email, GenericStatusConstant.ACTIVE);
    expect(portalUser).toBeDefined();

    let membership = await connection.getCustomRepository(MembershipRepository).findByUserAndAssociation(portalUser, testUser.association);
    expect(membership).toBeDefined();

  });


  it('Test that permissions are returned with when calling me', () => {
    return getAssociationUser(GenericStatusConstant.ACTIVE).then(associationUser => {
      return factory().upset(Role).use(role => {
        role.association = associationUser.association;
        return role;
      }).create().then(role => {
        return factory().upset(RolePermission).use(rolePermission => {
          rolePermission.role = role;
          return rolePermission;
        }).createMany(4).then(_ => {
          return factory().upset(MembershipRole).use(membershipRole => {
            membershipRole.role = role;
            membershipRole.membership = associationUser.user.membership;
            return membershipRole;
          }).createMany(4).then(() => {
            return request(applicationContext.getHttpServer())
              .get('/me')
              .set('Authorization', associationUser.token)
              .expect(200)
              .then(response => {
                let responseData = response.body.data;
                expect(responseData.firstName).toBeDefined();
                expect(responseData.lastName).toBeDefined();
                expect(responseData.username).toBeDefined();
                expect(responseData.email).toBeDefined();
                expect(responseData.phoneNumber).toBeDefined();
                expect(responseData.associations).toBeDefined();
                expect(responseData.associations.length).toEqual(1);
                expect(responseData.associations).toEqual(
                  expect.arrayContaining([
                    expect.objectContaining({
                      name: expect.anything(),
                      type: expect.anything(),
                      code: expect.anything(),
                      status: GenericStatusConstant.ACTIVE,
                      accounts: expect.arrayContaining([
                        expect.objectContaining({
                          accountCode: expect.anything(),
                          dateUpdated: expect.anything(),
                          name: expect.anything(),
                          type: expect.anything(),
                          permissions: expect.arrayContaining([
                            expect.objectContaining({
                              name: expect.anything(),
                              code: expect.anything(),
                            }),
                          ]),
                        }),
                      ]),
                    }),
                  ]),
                );
              });
          });
        });

      });
    });

  });


  it('Test that email should be sent to a user that has not been verified', async () => {
    let portalUser = await getTestUser(GenericStatusConstant.PENDING_ACTIVATION);
    const payload: PasswordResetDto = {
      email: portalUser.membership.portalUser.email,
    };
    await request(applicationContext.getHttpServer())
      .post(`/validate-principal`)
      .send(payload)
      .expect(200);

  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
})
;
