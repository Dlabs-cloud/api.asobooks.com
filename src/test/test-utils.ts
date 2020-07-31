import { Setting } from '../domain/entity/setting.entity';
import { EntityManager, getConnection } from 'typeorm';
import { SettingRepository } from '../dao/setting.repository';
import { Some } from 'optional-typescript';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { SignUpDto } from '../dto/auth/request/sign-up.dto';
import { AuthenticationService } from '../service/authentication.service';
import * as faker from 'faker';
import { LoginDto } from '../dto/auth/request/login.dto';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUserAccount } from '../domain/entity/portal-user-account.entity';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ServiceModule } from '../service/service.module';
import { AppService } from '../app.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BankUploadStartup } from '../core/start-ups/bank-upload.startup';
import { BankUploadStartupMock } from './mocks/bank-upload-startup.mock';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';


export const init = async (entityManager?: EntityManager) => {

  const setting = await getConnection().getCustomRepository(SettingRepository).findOneItemByStatus({
    label: 'trusted_ip_address',
  });

  await Some(setting).valueOrAsync(() => {
    const newSetting = new Setting();
    newSetting.label = 'trusted_ip_address';
    newSetting.value = '::ffff:127.0.0.1';
    return getConnection().transaction(async entityManager => {
      return await entityManager.save(newSetting);
    });
  });

};


export const mockLoginUser = async function(authenticationService: AuthenticationService) {
  const signUpUser = await this.mockActiveSignUpUser(authenticationService);
  const loginDto = new LoginDto();
  loginDto.username = signUpUser.username;
  loginDto.password = signUpUser.password;
  return await authenticationService.loginUser(loginDto);
};

export const mockNewSignUpUser = async (authenticationService: AuthenticationService): Promise<SignUpDto> => {


  const newUser: SignUpDto = {
    associationName: faker.name.lastName() + ' Association',
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: faker.random.uuid(),
    phoneNumber: faker.phone.phoneNumber(),
    associationType: faker.random.arrayElement(Object.values(AssociationTypeConstant)),
  };

  const membership = await authenticationService.signPrincipalUser(newUser);
  const portalAccount = membership.portalAccount;
  const portalUser = membership.portalUser;
  portalUser.status = portalAccount.status = membership.status = GenericStatusConstant.ACTIVE;
  await getConnection().transaction(async entityManager => {
    await entityManager.save(portalAccount);
    await entityManager.save(portalUser);
    await entityManager.save(membership);
  });


  return newUser;
};

export const getTestUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association) => {
  status = status ?? GenericStatusConstant.ACTIVE;
  association = association ?? await factory().upset(Association).use(association => {
    association.status = status;
    return association;
  }).create();
  const portalAccount = await factory().upset(PortalAccount).use(portalAccount => {
    portalAccount.status = status;
    return portalAccount;
  }).create();
  portalUser = portalUser ?? await factory().upset(PortalUser).use(portalUser => {
    portalUser.status = status;
    return portalUser;
  }).create();
  return await (factory().upset(PortalUserAccount).use(portalUserAccount => {
    portalUserAccount.portalAccount = portalAccount;
    portalUserAccount.portalUser = portalUser;
    portalUserAccount.status = status;
    portalUserAccount.association = association;
    return portalUserAccount;
  }).create());
};

export const getAssociationUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association) => {
  status = status ?? GenericStatusConstant.ACTIVE;
  association = association ?? await factory().upset(Association).use(association => {
    association.status = status;
    return association;
  }).create();
  let token = await getLoginUser(status, portalUser, association);

  const response = {
    token: token,
    associationCode: association.code,
  };
  return Promise.resolve(response);
};

export const getLoginUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association): Promise<string> => {
  status = status ?? GenericStatusConstant.ACTIVE;
  const portalUserAccount = await getTestUser(status, portalUser, association);

  const jwtPayload: JwtPayloadDto = {
    sub: portalUserAccount.portalUser.id,
    email: portalUserAccount.portalUser.email,
    subStatus: portalUserAccount.portalUser.status,
    type: TokenTypeConstant.LOGIN,
  };

  let authenticationUtils = new AuthenticationUtils();
  return authenticationUtils.generateGenericToken(jwtPayload).then(token => {
    const authorizationToken = `Bearer ${token}`;
    return Promise.resolve(authorizationToken);
  });


};


export const mockSendEmail = () => jest.fn().mockImplementation((sendEmailOptions: ISendMailOptions) => {
  return Promise.resolve('Email has been sent successfully');
});

export function baseTestingModule() {
  return Test.createTestingModule({
    imports: [AppModule, ServiceModule],
    providers: [AppService],
  }).overrideProvider(MailerService)
    .useValue({
      sendMail: mockSendEmail(),
    })
    .overrideProvider(BankUploadStartup)
    .useClass(BankUploadStartupMock);
}

export const PRINCIPAL_USER_REQUEST_DATA = {
  associationName: faker.name.firstName() + ' Association',
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.random.alphaNumeric() + faker.random.uuid(),
  phoneNumber: faker.phone.phoneNumber(),
  associationType: AssociationTypeConstant.COOPERATIVE,
};