import { Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Connection, EntityManager } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { UserUpdateDto } from '../dto/user/user-update.dto';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { EventBus } from '@nestjs/cqrs';
import { ForgotPasswordEvent } from '../event/forgot-password.event';
import { ChangePasswordDto } from '../dto/auth/request/change-password.dto';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { MembershipService } from './membership.service';
import { MembershipRepository } from '../dao/membership.repository';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import { Association } from '../domain/entity/association.entity';
import { PortalUserService } from './portal-user.service';
import { PortalUserDto } from '../dto/portal-user.dto';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { PortalAccountDto } from '../dto/portal-account.dto';
import { MembershipDto } from '../dto/membership.dto';
import { AssociationMembershipSignUpEvent } from '../event/AssociationMembershipSignUpEvent';
import { GroupService } from './group.service';
import { GroupRepository } from '../dao/group.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { ActivityLogEventBuilder } from '../event/builder/activity-log.event.builder';
import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';
import { Address } from '../domain/entity/address.entity';
import { CountryRepository } from '../dao/country.repository';
import { Membership } from '../domain/entity/membership.entity';

@Injectable()
export class UserManagementService {

  constructor(private readonly connection: Connection,
              private readonly authenticationUtils: AuthenticationUtils,
              private readonly portalAccountService: PortalAccountService,
              private readonly membershipService: MembershipService,
              private readonly portalUserService: PortalUserService,
              private readonly groupService: GroupService,
              private readonly eventBus: EventBus) {
  }


  public async validatePrincipalUser(portalUser: PortalUser, portalAccount: PortalAccount) {

    return this.connection.transaction(async entityManager => {
      portalUser.status = GenericStatusConstant.ACTIVE;
      portalUser.updatedAt = new Date();
      await entityManager.save(portalUser);
      await this.portalAccountService.activatePortalAccount(entityManager, portalAccount);
      let membership = await entityManager
        .getCustomRepository(MembershipRepository)
        .findByPortalAccountAndPortalUser(portalUser, portalAccount, GenericStatusConstant.PENDING_ACTIVATION);
      await this.membershipService.activateMembership(entityManager, membership);
      return portalUser;
    });
  }

  public async resetPassword(portalUser: PortalUser) {
    return this.connection.transaction(async entityManager => {
      let userUpdateDto = new UserUpdateDto();
      userUpdateDto.status = portalUser.status === GenericStatusConstant.PENDING_ACTIVATION ? GenericStatusConstant.PENDING_ACTIVATION : GenericStatusConstant.IN_ACTIVE;
      await this.updateUser(entityManager, portalUser, userUpdateDto);
      this.eventBus.publish(new ForgotPasswordEvent(portalUser));
      return portalUser;
    });
  }

  public async changePortalUserPassword(portalUser: PortalUser, changePasswordDto: ChangePasswordDto) {
    return this.connection.transaction(async entityManager => {
      if (portalUser.status === GenericStatusConstant.PENDING_ACTIVATION) {
        await this.connection
          .getCustomRepository(PortalAccountRepository)
          .findFirstByPortalUserAndStatus(portalUser, false, GenericStatusConstant.PENDING_ACTIVATION)
          .then(portalAccount => {
            return this.validatePrincipalUser(portalUser, portalAccount);
          });
      }
      let userUpdateDto = new UserUpdateDto();
      userUpdateDto.password = await this.authenticationUtils.hashPassword(changePasswordDto.password);
      userUpdateDto.status = GenericStatusConstant.ACTIVE;
      await this.updateUser(entityManager, portalUser, userUpdateDto);
      return portalUser;
    });
  }

  public async updateUser(entityManager: EntityManager, portalUser: PortalUser, userUpdateDto: UserUpdateDto) {

    if (userUpdateDto.firstName) {
      portalUser.firstName = userUpdateDto.firstName;
    }
    if (userUpdateDto.lastName) {
      portalUser.lastName = userUpdateDto.lastName;
    }
    if (userUpdateDto.status) {
      portalUser.status = userUpdateDto.status;
    }
    if (userUpdateDto.phoneNumber) {
      portalUser.phoneNumber = userUpdateDto.phoneNumber;
    }
    if (userUpdateDto.password) {
      portalUser.password = userUpdateDto.password;
    }
    portalUser.updatedAt = new Date();
    await entityManager.save(portalUser);
    return portalUser;
  }


  public async createAssociationMember(membershipSignUp: MemberSignUpDto, association: Association, createdBy: PortalUser) {
    return await this.connection.transaction(async entityManager => {
      let portalUserDto: PortalUserDto = {
        email: membershipSignUp.email,
        firstName: membershipSignUp.firstName,
        lastName: membershipSignUp.lastName,
        password: Math.random().toString(36).slice(-8),
        phoneNumber: membershipSignUp.phoneNumber,
        username: membershipSignUp.email,
      };
      const portalUser = await this.portalUserService.createPortalUser(entityManager, portalUserDto, GenericStatusConstant.ACTIVE);
      let portalAccount: PortalAccount = null;

      for (let i = 0; i < membershipSignUp.types.length; i++) {
        const membershipType: PortalAccountTypeConstant = membershipSignUp.types[i];
        portalAccount = await entityManager
          .getCustomRepository(PortalAccountRepository)
          .findByStatusAndTypeAndAssociations(membershipType, GenericStatusConstant.ACTIVE, association);
        if (membershipType === PortalAccountTypeConstant.EXECUTIVE_ACCOUNT && portalAccount) {
          const membershipDto: MembershipDto = { association, portalAccount, portalUser };
          const membership = await this.membershipService
            .createMembership(entityManager, membershipDto, GenericStatusConstant.ACTIVE)
            .then(membership => {
              return this.updateIdentifierAndAddress(entityManager, membershipSignUp, membership);
            });
        }

        if (membershipType === PortalAccountTypeConstant.MEMBER_ACCOUNT) {
          if (!portalAccount) {
            const portalAccountDto: PortalAccountDto = {
              association: association,
              name: `${association.name} Membership Account`,
              type: PortalAccountTypeConstant.MEMBER_ACCOUNT,
            };
            portalAccount = await this.portalAccountService.createPortalAccount(entityManager, portalAccountDto, GenericStatusConstant.ACTIVE);
          }

          const membershipDto: MembershipDto = { association, portalAccount, portalUser };
          let membership = await this.membershipService.createMembership(entityManager, membershipDto, GenericStatusConstant.ACTIVE);

          let groups = await entityManager
            .getCustomRepository(GroupRepository)
            .findByAssociation(association, GroupTypeConstant.GENERAL);
          if (!groups && groups.length < 0) {
            throw new IllegalArgumentException('Association does dont have a general group');
          }
          let group = groups[0];
          await this.groupService.addMember(entityManager, group, membership);
        }
      }
      this.eventBus.publish(new AssociationMembershipSignUpEvent(portalUser));
    });
  }

  public deActivateUser(portalUser: PortalUser, association: Association) {
    return this.connection.transaction(async entityManager => {
      portalUser.status = GenericStatusConstant.DELETED;
      await entityManager.save(portalUser);
      return this.membershipService
        .deactivateUserMemberships(entityManager, portalUser, association);
    });
  }


  private async updateIdentifierAndAddress(entityManager: EntityManager, data: MemberSignUpDto, membership: Membership) {
    membership.identificationNumber = data.identifier || membership.identificationNumber;
    if (data.address) {
      const address = new Address();
      membership.address = await entityManager
        .getCustomRepository(CountryRepository)
        .findOne({ code: data.address.countryCode })
        .then(country => {
          address.country = country;
          address.name = data.address.address;
          address.unit = data.address.unit;
          return entityManager.save(address);
        });
    }
    return entityManager.save(membership);
  }
}