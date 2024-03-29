import { Setting } from '../domain/entity/setting.entity';
import { EntityManager, getConnection } from 'typeorm';
import { SettingRepository } from '../dao/setting.repository';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { SignUpDto } from '../dto/auth/request/sign-up.dto';
import { AuthenticationService } from '../service-impl/authentication.service';
import * as faker from 'faker';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
import { AppService } from '../app.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BankUploadStartup } from '../core/start-ups/bank-upload.startup';
import { BankUploadStartupMock } from './mocks/bank-upload-startup.mock';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { Membership } from '../domain/entity/membership.entity';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { Group } from '../domain/entity/group.entity';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { WorkerModule } from '../worker/worker.module';
import { PaymentModule } from '@dlabs/payment';
import { Bill } from '../domain/entity/bill.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { FakerService } from '../service-impl/faker.service';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { PortalAccountRepository } from '../dao/portal-account.repository';


export const init = async (entityManager?: EntityManager) => {

  const setting = await getConnection().getCustomRepository(SettingRepository).findOneItemByStatus({
    label: 'trusted_ip_address',
  });

  if (Setting) {
    const newSetting = new Setting();
    newSetting.label = 'trusted_ip_address';
    newSetting.value = '::ffff:127.0.0.1';
    return getConnection().transaction(async entityManager => {
      return await entityManager.save(newSetting);
    });
  }


};


export const mockPaymentTransactions = async (association: Association) => {
  const membershipInfos = await factory().upset(MembershipInfo).use(membershipInfo => {
    membershipInfo.association = association;
    return membershipInfo;
  }).createMany(10);
  const memberships = await getConnection().getCustomRepository(PortalAccountRepository)
    .findByStatusAndAssociation(GenericStatusConstant.ACTIVE, association)
    .then(portalAccounts => {
      const portalAccount = portalAccounts.find(portalAccount => portalAccount.type === PortalAccountTypeConstant.MEMBER_ACCOUNT);
      const memberships = membershipInfos.map(membershipInfo => {
        return factory().upset(Membership).use(membership => {
          membership.portalAccount = portalAccount;
          membership.portalUser = membershipInfo.portalUser;
          membership.membershipInfo = membershipInfo;
          return membership;
        }).create();
      });
      return Promise.all(memberships);
    });

  await factory().upset(Bill).use(bill => {
    bill.paymentStatus = PaymentStatus.NOT_PAID;
    bill.membership = memberships[0];
    bill.payableAmountInMinorUnit = 5000_00;
    return bill;
  }).createMany(5);

  await factory().upset(Bill).use(bill => {
    bill.paymentStatus = PaymentStatus.PAID;
    bill.membership = memberships[0];
    bill.payableAmountInMinorUnit = 5000_00;
    return bill;
  }).createMany(4);

  const invoicePromises = memberships.map(membership => {
    return factory().upset(Invoice).use(invoice => {
      invoice.association = association;
      invoice.createdBy = membership;
      return invoice;
    }).create();
  });

  const invoices: Invoice[] = await Promise.all(invoicePromises);

  const paymentRequestPromises = invoices.map(invoice => {
    return factory().upset(PaymentRequest).use(paymentRequest => {
      paymentRequest.association = association;
      paymentRequest.invoice = invoice;
      return paymentRequest;
    }).create();
  });
  const paymentRequests = await Promise.all(paymentRequestPromises);
  const paymentTransactionPromises = paymentRequests.map(paymentRequest => {
    return factory().upset(PaymentTransaction).use(paymentTransaction => {
      paymentTransaction.paymentRequest = paymentRequest;
      paymentTransaction.amountInMinorUnit = 50_000_00;
      return paymentTransaction;
    }).create();
  });

  return await Promise.all(paymentTransactionPromises);
};

export const mockNewSignUpUser = async (authenticationService: AuthenticationService): Promise<SignUpDto> => {


  const newUser: SignUpDto = {
    associationName: faker.name.lastName() + ' Association',
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: faker.random.uuid(),
    phoneNumber: faker.phone.phoneNumber(),
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

export const getTestUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association, accountType = PortalAccountTypeConstant.MEMBER_ACCOUNT) => {
  status = status ?? GenericStatusConstant.ACTIVE;
  association = association ?? await factory().upset(Association).use(association => {
    association.status = status;
    return association;
  }).create();
  portalUser = portalUser ?? await factory().upset(PortalUser).use(portalUser => {
    portalUser.status = status;
    return portalUser;
  }).create();
  const membershipInfo = await factory().upset(MembershipInfo).use(membersipInfo => {
    membersipInfo.association = association;
    membersipInfo.portalUser = portalUser;
    return membersipInfo;
  }).create();


  const portalAccounts = await factory()
    .upset(PortalAccount)
    .use(portalAccount => {
      portalAccount.status = status;
      portalAccount.association = association;
      portalAccount.type = PortalAccountTypeConstant.EXECUTIVE_ACCOUNT;
      return portalAccount;
    }).create().then(executiveAccount => {
      return factory().upset(PortalAccount).use(membershipPortalAccount => {
        membershipPortalAccount.status = status;
        membershipPortalAccount.association = association;
        membershipPortalAccount.type = PortalAccountTypeConstant.MEMBER_ACCOUNT;
        return membershipPortalAccount;
      }).create().then(membershipAccount => {
        return [membershipAccount, executiveAccount];
      });
    });


  const membershipPromise = portalAccounts.map(portalAccount => {
    return factory()
      .upset(Membership)
      .use(membership => {
        membership.portalAccount = portalAccount;
        membership.portalUser = portalUser;
        membership.membershipInfo = membershipInfo;
        membership.status = status;
        return membership;
      }).create();
  });
  const memberships = await Promise.all(membershipPromise);
  const membership = memberships.find(membership => membership.portalAccount.type === accountType);

  let group = await factory().upset(Group).use(group => {
    group.association = association;
    group.type = GroupTypeConstant.GENERAL;
    return group;
  }).create();
  await factory().upset(GroupMembership).use(membershipGroup => {
    membershipGroup.membership = membership;
    membershipGroup.group = group;
    return membershipGroup;
  }).create();

  return { membership, association };
};

export const getAssociationUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association, accountType = PortalAccountTypeConstant.EXECUTIVE_ACCOUNT) => {
  status = status ?? GenericStatusConstant.ACTIVE;
  association = association ?? await factory()
    .upset(Association)
    .use(association => {
      association.status = status;
      return association;
    })
    .create();
  let loginDetails = await getLoginUser(status, portalUser, association, accountType);

  const response = {
    token: loginDetails.token,
    association,
    user: loginDetails.user,

  };
  return Promise.resolve(response);
};

export function generateToken(membership: Membership) {
  const jwtPayload: JwtPayloadDto = {
    sub: membership.portalUser.id,
    email: membership.portalUser.email,
    subStatus: membership.portalUser.status,
    type: TokenTypeConstant.LOGIN,
  };

  let authenticationUtils = new AuthenticationUtils();
  return authenticationUtils.generateGenericToken(jwtPayload).then(token => {
    const authorizationToken = `Bearer ${token}`;
    return Promise.resolve(authorizationToken);
  });
}

export const getLoginUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association, accountType = PortalAccountTypeConstant.EXECUTIVE_ACCOUNT) => {
  status = status ?? GenericStatusConstant.ACTIVE;
  const testUser = await getTestUser(status, portalUser, association, accountType);
  const membership = testUser.membership;
  return generateToken(membership).then(token => {
    return {
      token,
      user: testUser,
    };
  });
};


export const mockSendEmail = () => jest.fn().mockImplementation((sendEmailOptions: ISendMailOptions) => {
  return Promise.resolve('Email has been sent successfully');
});

export const mockFakerService = () => jest.fn().mockResolvedValue(null);

export function baseTestingModule() {
  return Test.createTestingModule({
    imports: [AppModule, ServiceImplModule, WorkerModule, PaymentModule],
    providers: [AppService],
  }).overrideProvider(MailerService)
    .useValue({
      sendMail: mockSendEmail(),
    })
    .overrideProvider(FakerService)
    .useValue({
      seed: mockFakerService(),
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
  associationType: AssociationTypeConstant.COOPERATIVE,
};