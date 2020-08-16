import { Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Connection, EntityManager } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { UserUpdateDto } from '../dto/user/user-update.dto';
import { Some } from 'optional-typescript';
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
import { PortalUserRepository } from '../dao/portal-user.repository';

@Injectable()
export class UserManagementService {

  constructor(private readonly connection: Connection,
              private readonly authenticationUtils: AuthenticationUtils,
              private readonly portalAccountService: PortalAccountService,
              private readonly membershipService: MembershipService,
              private readonly portalUserService: PortalUserService,
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
      userUpdateDto.status = GenericStatusConstant.IN_ACTIVE;
      await this.updateUser(entityManager, portalUser, userUpdateDto);
      this.eventBus.publish(new ForgotPasswordEvent(portalUser));
      return portalUser;
    });
  }

  public async changePortalUserPassword(portalUser: PortalUser, changePasswordDto: ChangePasswordDto) {
    return this.connection.transaction(async entityManager => {
      let userUpdateDto = new UserUpdateDto();
      userUpdateDto.password = await this.authenticationUtils.hashPassword(changePasswordDto.password);
      userUpdateDto.status = GenericStatusConstant.ACTIVE;
      await this.updateUser(entityManager, portalUser, userUpdateDto);
      return portalUser;
    });
  }

  public async updateUser(entityManager: EntityManager, portalUser: PortalUser, userUpdateDto: UserUpdateDto) {

    Some(userUpdateDto.firstName).ifPresent((firstName) => {
      portalUser.firstName = firstName;
    });
    Some(userUpdateDto.lastName).ifPresent((lastName) => {
      portalUser.lastName = lastName;
    });
    Some(userUpdateDto.status).ifPresent(status => {
      portalUser.status = status;
    });
    Some(userUpdateDto.phoneNumber).ifPresent(phoneNumber => {
      portalUser.phoneNumber = phoneNumber;
    });
    Some(userUpdateDto.password).ifPresent(password => {
      portalUser.password = password;
    });
    portalUser.updatedAt = new Date();
    await entityManager.save(portalUser);
    return portalUser;
  }


  public async createAssociationMember(membershipSignUp: MemberSignUpDto, association: Association) {
    return  await this.connection.transaction(async entityManager => {
      let portalUser = await this.connection.getCustomRepository(PortalUserRepository)
        .findByUserNameOrEmailOrPhoneNumberAndNotDeleted(membershipSignUp.email);
      if (portalUser) {
        portalUser.lastName = membershipSignUp.lastName;
        portalUser.phoneNumber = membershipSignUp.phoneNumber;
        portalUser.firstName = membershipSignUp.firstName;
        await entityManager.save(portalUser);
      } else {
        let portalUserDto: PortalUserDto = {
          email: membershipSignUp.email,
          firstName: membershipSignUp.firstName,
          lastName: membershipSignUp.lastName,
          password: Math.random().toString(36).slice(-8),
          phoneNumber: membershipSignUp.phoneNumber,
          username: membershipSignUp.email,
        };
        portalUser = await this.portalUserService.createPortalUser(entityManager, portalUserDto, GenericStatusConstant.ACTIVE);
      }

      let portalAccount: any = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findByStatusAndTypeAndAssociations(PortalAccountTypeConstant.MEMBER_ACCOUNT, GenericStatusConstant.ACTIVE, association);
      if (!portalAccount) {
        const portalAccountDto: PortalAccountDto = {
          association: association,
          name: `${association.name} Membership Account`,
          type: PortalAccountTypeConstant.MEMBER_ACCOUNT,
        };
        portalAccount = await this.portalAccountService.createPortalAccount(entityManager, portalAccountDto, GenericStatusConstant.ACTIVE);
      }

      const membershipDto: MembershipDto = { association, portalAccount, portalUser };
      await this.membershipService.createMembership(entityManager, membershipDto, GenericStatusConstant.ACTIVE);

      this.eventBus.publish(new AssociationMembershipSignUpEvent(portalUser));
      return portalUser;
    });

  }

}