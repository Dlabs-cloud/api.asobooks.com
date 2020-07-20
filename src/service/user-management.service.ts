import { Inject, Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Connection, EntityManager } from 'typeorm';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { MembershipRepository } from '../dao/membership.repository';
import { MembershipService } from './membership.service';
import { UserUpdateDto } from '../dto/user/user-update.dto';
import { Some } from 'optional-typescript';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { EventBus } from '@nestjs/cqrs';
import { ForgotPasswordEvent } from '../event/forgot-password.event';
import { ChangePasswordDto } from '../dto/auth/request/change-password.dto';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { InvalidtokenException } from '../exception/invalidtoken.exception';

@Injectable()
export class UserManagementService {

  constructor(private readonly connection: Connection,
              private readonly authenticationUtils: AuthenticationUtils,
              private readonly portalAccountService: PortalAccountService,
              private readonly membershipRepository: MembershipRepository,
              private readonly membershipService: MembershipService,
              private readonly eventBus: EventBus,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>) {
  }


  public async validatePrincipalUser(callbackToken: string) {
    const payload = await this.emailValidationService
      .validateEmailCallBackToken(callbackToken, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP);

    const portalUser = payload.portalUser;
    const portalAccount = payload.portalAccount;
    if (!portalAccount) {
      throw new InvalidtokenException('token is not valid');
    }
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

  public async changePassword(callbackToken: string, changePasswordDto: ChangePasswordDto) {
    let payload = await this.emailValidationService.validateEmailCallBackToken(callbackToken, TokenTypeConstant.FORGOT_PASSWORD);
    return this.connection.transaction(async entityManager => {
      let userUpdateDto = new UserUpdateDto();
      userUpdateDto.password = await this.authenticationUtils.hashPassword(changePasswordDto.password);
      userUpdateDto.status = GenericStatusConstant.ACTIVE;
      await this.updateUser(entityManager, payload.portalUser, userUpdateDto);
      return payload.portalUser;
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
}