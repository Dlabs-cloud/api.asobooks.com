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

@Injectable()
export class FakerService implements OnApplicationBootstrap {

  constructor(private readonly connection: Connection,
              private readonly authenticationUtils: AuthenticationUtils) {
  }


  onApplicationBootstrap(): any {
    return this.seed();

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
                pUser.email = 'seeders@asobooks.com';
                pUser.password = hash;
                return pUser;
              }).create();
            }).then(portalUser => {

              return this.getTestUser(GenericStatusConstant.ACTIVE, portalUser, null, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
                .then(testUser => {
                  return this.seedPaymentTransactions(testUser.association)
                    .then(() => {
                      return this.createWallet(testUser.association);
                    })
                    .then(() => {
                      return this.seedActivityLog(testUser.association);
                    });
                });


            });
        }
      });
  }


  seedActivityLog(association: Association) {
    return factory().upset(ActivityLog).use(activityLog => {
      activityLog.association = association;
      return activityLog;
    }).createMany(50);
  }


  async seedPaymentTransactions(association) {
    const paymentRequests = await factory().upset(PaymentRequest).use(paymentRequest => {
      paymentRequest.association = association;
      return paymentRequest;
    }).createMany(50);
    for (let i = 0; i < paymentRequests.length; i++) {
      const paymentRequest = paymentRequests[i];
      await factory().upset(PaymentTransaction).use(pTransaction => {
        pTransaction.paymentRequest = paymentRequest;
        return pTransaction;
      }).create();
    }

  }


  createWallet(association: Association) {
    return factory().upset(Wallet).use(wallet => {
      wallet.association = association;
      return wallet;
    }).create();
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
        portalAccount.type = accountType;
        return portalAccount;
      }).create();
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


}