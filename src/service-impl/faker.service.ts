import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { factory } from '../test/factory';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Connection } from 'typeorm/connection/Connection';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { Association } from '../domain/entity/association.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Membership } from '../domain/entity/membership.entity';
import { Group } from '../domain/entity/group.entity';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { Wallet } from '../domain/entity/wallet.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { ActivityLog } from '../domain/entity/activity-log.entity';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { Invoice } from '../domain/entity/invoice.entity';
import { ServiceFeeService } from './service-fee.service';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import * as moment from 'moment';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import * as faker from 'faker';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRequestDto } from '../dto/subscription.request.dto';
import { Subscription } from '../domain/entity/subcription.entity';
import { MembershipRepository } from '../dao/membership.repository';
import { BillService } from './bill.service';
import { getManager } from 'typeorm';
import { Permission } from '../domain/entity/permission.entity';
import { Role } from '../domain/entity/role.entity';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { AccountDetail } from '../domain/entity/account-detail.entity';
import { Bank } from '../domain/entity/bank.entity';

@Injectable()
export class FakerService implements OnApplicationBootstrap {

  constructor(private readonly connection: Connection,
              private readonly feeService: ServiceFeeService,
              private readonly subscriptionService: SubscriptionService,
              private readonly billsService: BillService,
              private readonly authenticationUtils: AuthenticationUtils) {
  }


  onApplicationBootstrap(): any {
    return this.seed().catch(err => {
      console.log(err);
    });

  }

  seed() {
    const email = 'seeders@asobooks.com';
    return this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndNotDeleted(email).then(poralUser => {
        if (!poralUser) {
          return this.authenticationUtils
            .hashPassword('asobooks')
            .then(hash => {
              return factory().upset(PortalUser).use(pUser => {
                pUser.email = email;
                pUser.password = hash;
                return pUser;
              }).create();
            }).then(portalUser => {
              return this.getTestUser(GenericStatusConstant.ACTIVE, portalUser, null, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
                .then(testUser => {
                  return factory().upset(MembershipInfo).use(mInfo => {
                    mInfo.portalUser = portalUser;
                    mInfo.association = testUser.association;
                    return mInfo;
                  })
                    .create()
                    .then(() => {
                      return this
                        .createAccounts(testUser.association, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
                        .then(() => {
                          return this.createAccounts(testUser.association, PortalAccountTypeConstant.MEMBER_ACCOUNT).then(members => {
                            const paymentTransactions = members.map(member => {
                              return this.createPaymentTransactions(member, testUser.association);
                            });
                            return Promise.all(paymentTransactions);
                          }).then(() => {
                            return this.createRolePermissions(testUser.association);
                          }).then(() => {
                            return this.createWallet(testUser.association);
                          }).then(() => {
                            return this.seedActivityLog(testUser.association);
                          }).then(_ => {
                            return this.seedServiceFee(testUser.association);
                          }).then(_ => {
                            return this.seedAccountDetails();
                          });
                        });

                    });

                });
            });
        }
      });
  }


  async createRolePermissions(association: Association) {
    const permissions = await factory().createMany(10, Permission);
    const roles = await factory().upset(Role).use(role => {
      role.association = association;
      return role;
    }).createMany(3);
    const rolePromise = roles.map(role => {
      const rolePermPromise = permissions.map(permission => {
        return factory().upset(RolePermission).use(rolePermission => {
          rolePermission.permission = permission;
          rolePermission.role = role;
          return rolePermission;
        }).create();
      });
      return Promise.all(rolePermPromise);
    });

    return Promise.all(rolePromise);
  }

  seedActivityLog(association: Association) {
    return factory().upset(ActivityLog).use(activityLog => {
      activityLog.association = association;
      return activityLog;
    }).createMany(50);
  }

  createWallet(association: Association) {
    return factory().upset(Wallet).use(wallet => {
      wallet.association = association;
      return wallet;
    }).create();
  }

  async createAccounts(association, type: PortalAccountTypeConstant) {
    const membershipInfos = await factory().upset(MembershipInfo).use(membershipInfo => {
      membershipInfo.association = association;
      return membershipInfo;
    }).createMany(50);
    let portalAccount = await this.connection.getCustomRepository(PortalAccountRepository)
      .findOne({
        type,
        association: association,
      });
    const membershipPromise = membershipInfos.map(membershipInfo => {
      return factory().upset(Membership).use(membership => {
        membership.portalAccount = portalAccount;
        membership.portalUser = membershipInfo.portalUser;
        membership.membershipInfo = membershipInfo;
        return membership;
      }).create();
    });
    return Promise.all(membershipPromise);
  }

  createPaymentTransactions(member: Membership, association: Association) {
    return factory().upset(Invoice).use(invoice => {
      invoice.createdBy = member;
      invoice.association = association;
      return invoice;
    }).create().then(invoice => {
      return factory().upset(PaymentRequest).use(paymenRequest => {
        paymenRequest.association = association;
        paymenRequest.invoice = invoice;
        paymenRequest.initiatedBy = member;
        return paymenRequest;
      }).create();
    }).then(paymentRequest => {
      return factory().upset(PaymentTransaction).use(paymentTransaction => {
        paymentTransaction.paymentRequest = paymentRequest;
        return paymentTransaction;
      }).create();
    });
  }


  getTestUser = async (status?: GenericStatusConstant, portalUser?: PortalUser, association?: Association, accountType = PortalAccountTypeConstant.MEMBER_ACCOUNT) => {
    status = status ?? GenericStatusConstant.ACTIVE;
    association = association ?? await factory().upset(Association).use(association => {
      association.status = status;
      return association;
    }).create();
    const portalAccount = await factory()
      .upset(PortalAccount)
      .use(portalAccount => {
        portalAccount.status = status;
        portalAccount.association = association;
        portalAccount.type = PortalAccountTypeConstant.EXECUTIVE_ACCOUNT;
        return portalAccount;
      }).create().then((executiveAccount) => {
        return factory().upset(PortalAccount).use(portalAccount => {
          portalAccount.status = status;
          portalAccount.association = association;
          portalAccount.type = PortalAccountTypeConstant.MEMBER_ACCOUNT;
          return portalAccount;
        }).create().then(membershipExecutive => {
          const portalAccount = [executiveAccount, membershipExecutive]
            .find(paccount => paccount.type === accountType);
          return Promise.resolve(portalAccount);
        });
      });
    portalUser = portalUser ?? await factory().upset(PortalUser).use(portalUser => {
      portalUser.status = status;
      return portalUser;
    }).create();


    let membership = await (factory()
      .upset(Membership)
      .use(membership => {
        membership.portalAccount = portalAccount;
        membership.portalUser = portalUser;
        membership.status = status;
        return membership;
      }).create());
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


  public async seedServiceFee(association: Association) {
    for (let i = 0; i <= 50; i++) {
      let requestPayload: ServiceFeeRequestDto = {
        amountInMinorUnit: 1000000,
        cycle: BillingCycleConstant.WEEKLY,
        description: faker.random.words(10),
        billingStartDate: moment(faker.date.future()).format('DD/MM/YYYY'),
        name: faker.random.words(2),
        type: ServiceTypeConstant.RE_OCCURRING,
      };
      await this.feeService.createService(requestPayload, association)
        .then(serviceFee => this.seedSubscription(serviceFee, association));
    }

    for (let i = 0; i <= 50; i++) {
      let requestPayload: ServiceFeeRequestDto = {
        amountInMinorUnit: 1000000,
        cycle: BillingCycleConstant.ONE_OFF,
        description: faker.random.words(10),
        billingStartDate: moment(faker.date.future()).format('DD/MM/YYYY'),
        name: faker.random.words(2),
        type: ServiceTypeConstant.ONE_TIME,
      };

      await this.feeService.createService(requestPayload, association).then(serviceFee => {
        const entityManager = this.connection.createEntityManager();
        const sub: SubscriptionRequestDto = {
          description: faker.random.word(),
        };
        return this.subscriptionService
          .createSubscription(entityManager, serviceFee, sub)
          .then(sub => {
            return this.createBills(sub, association);
          });
      });
    }
  }

  public async seedSubscription(serviceFee: ServiceFee, asss: Association) {
    for (let i = 0; i < 50; i++) {
      const sub: SubscriptionRequestDto = {
        description: faker.random.word(),
      };
      await this.subscriptionService.createSubscription(getManager(), serviceFee, sub)
        .then(subscription => {
          return this.createBills(subscription, asss);
        });
    }
  }


  createBills(subscription: Subscription, association: Association) {
    return this.connection
      .getCustomRepository(MembershipRepository).findByAssociationAndQuery(association, {
        limit: 50,
        offset: 0,
        accountType: PortalAccountTypeConstant.MEMBER_ACCOUNT,
      }).then(async members => {
        for (let i = 0; i < members.length; i++) {
          await this.billsService.createSubscriptionBill(subscription, members[i]);
        }
      });
  }


  async seedAccountDetails() {
    const stBank = await Bank.findOne({ id: 1 });
    const ndBank = await Bank.findOne({ id: 2 });
    await factory().upset(AccountDetail).use(accountDetail => {
      accountDetail.bank = stBank;
      accountDetail.number = '1234567890';
      return accountDetail;
    }).create();

    await factory().upset(AccountDetail).use(accountDetail => {
      accountDetail.bank = ndBank;
      accountDetail.number = '1234567899';
      return accountDetail;
    }).create();


  }


}
