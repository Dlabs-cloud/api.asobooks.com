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
import { MembershipDto } from '../dto/membership.dto';
import { AssociationMembershipSignUpEvent } from '../event/AssociationMembershipSignUpEvent';
import { GroupService } from './group.service';
import { GroupRepository } from '../dao/group.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { CountryRepository } from '../dao/country.repository';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { MembershipInfoService } from './membership-info.service';
import { AddressDto } from '../dto/address.dto';
import { EditMemberDto } from '../dto/edit-member.dto';
import { AddressService } from './address.service';
import { ProfileUpdateDto } from '../dto/profile-update.dto';
import { profile } from 'winston';

@Injectable()
export class UserManagementService {

  constructor(private readonly connection: Connection,
              private readonly authenticationUtils: AuthenticationUtils,
              private readonly portalAccountService: PortalAccountService,
              private readonly membershipService: MembershipService,
              private readonly portalUserService: PortalUserService,
              private readonly membershipInfoService: MembershipInfoService,
              private readonly groupService: GroupService,
              private readonly addressService: AddressService,
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

      let addressDto: AddressDto = null;


      if (membershipSignUp.address) {
        addressDto = {
          country: await entityManager.getCustomRepository(CountryRepository).findOne({ code: membershipSignUp.address.countryCode }),
          name: membershipSignUp.address.address,
          unit: membershipSignUp.address.unit,
        };
      }
      const membershipInfo = await this.membershipInfoService
        .createMembershipInfo(entityManager,
          portalUser,
          association,
          addressDto, membershipSignUp.identifier);
      let portalAccount: PortalAccount = null;

      if (membershipSignUp.types.length < 1) {
        throw new IllegalArgumentException('At least one type must be provided');
      }

      let portalAccounts = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findByStatusAndAssociation(GenericStatusConstant.ACTIVE, association);

      if (portalAccounts.length < 2) {
        throw new IllegalArgumentException('An executive account and member account should have been created for association');
      }

      for (let i = 0; i < membershipSignUp.types.length; i++) {
        const portalAccountType = membershipSignUp.types[i];
        if (portalAccountType === PortalAccountTypeConstant.EXECUTIVE_ACCOUNT) {
          portalAccount = portalAccounts.find(portalAccount => portalAccount.type === portalAccountType);
          const membershipDto: MembershipDto = { association, portalAccount, portalUser, membershipInfo };
          await this.membershipService
            .createMembership(entityManager, membershipDto, GenericStatusConstant.ACTIVE);
        } else {
          portalAccount = portalAccounts
            .find(portalAccount => portalAccount.type === portalAccountType);
          const membershipDto: MembershipDto = { association, portalAccount, portalUser, membershipInfo };
          let membership = await this.membershipService
            .createMembership(entityManager, membershipDto, GenericStatusConstant.ACTIVE);
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
      return Promise.resolve(association);
    });
  }


  public deActivateUser(membershipInfo: MembershipInfo, association: Association) {
    return this.connection.transaction(async entityManager => {
      membershipInfo.status = GenericStatusConstant.DELETED;
      const portalUser = membershipInfo.portalUser;
      portalUser.status = GenericStatusConstant.DELETED;
      await entityManager.save(portalUser).then(() => entityManager.save(membershipInfo));
      return this.membershipService
        .deactivateUserMemberships(entityManager, portalUser, association);
    });
  }


  async updateProfile(portalUser: PortalUser, profileUpdate: ProfileUpdateDto) {
    if (profileUpdate.firstName) {
      portalUser.firstName = profileUpdate.firstName;
    }
    if (profileUpdate.lastName) {
      portalUser.lastName = profileUpdate.lastName;
    }

    if (profileUpdate.newPassword && profileUpdate.password) {
      portalUser.password = await this.authenticationUtils
        .comparePassword(profileUpdate.password, portalUser.password)
        .then(isCorrect => {
          if (!isCorrect) {
            throw new IllegalArgumentException('Password do not match');
          }
          return this.authenticationUtils
            .hashPassword(profileUpdate.newPassword);
        });
    }
    return portalUser.save();
  }

  public async updateMembership(association: Association, membershipInfo: MembershipInfo, updateInfo: EditMemberDto) {
    await this.connection.transaction(async entityManager => {
      const portalUser = membershipInfo.portalUser;
      if (updateInfo.firstName) {
        portalUser.firstName = updateInfo.firstName;
      }
      if (updateInfo.lastName) {
        portalUser.lastName = updateInfo.lastName;
      }
      if (updateInfo.address) {
        const addressUpdate = updateInfo.address;
        await this.addressService.updateMemberAddress(entityManager, membershipInfo, addressUpdate);
      }
      if (updateInfo.phoneNumber) {
        portalUser.phoneNumber = updateInfo.phoneNumber;
      }
      await entityManager.save(portalUser);
      const portalAccounts = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findByStatusAndAssociation(GenericStatusConstant.ACTIVE, association);

      const memberships = await entityManager
        .getCustomRepository(MembershipRepository)
        .findByUserAndAssociation(portalUser, association)
        .then(memberships => {
          memberships.every(membership => {
            membership.portalAccount = portalAccounts
              .find(portalAccount => portalAccount.id === membership.portalAccountId);
          });
          return Promise.resolve(memberships);
        });

      for (const type of updateInfo.types) {
        const portalAccount = portalAccounts.find(portalAccount => portalAccount.type === type);
        const membership = memberships.find(membership => membership.portalAccount.type === type);
        if (!membership) {
          let membershipDto: MembershipDto = {
            association: association,
            membershipInfo: membershipInfo,
            portalAccount: portalAccount,
            portalUser: portalUser,
          };
          await this.membershipService.createMembership(entityManager, membershipDto);
        }
      }

      const updatedMemberships = memberships.map(membership => {
        const accountType = updateInfo.types.find(type => type === membership.portalAccount.type);
        if (!accountType) {
          membership.status = GenericStatusConstant.DELETED;
          return entityManager.save(membership);
        }
        return Promise.resolve(membership);
      });
      return Promise.all(updatedMemberships).then(() => Promise.resolve(portalUser));
    });
  }

}
