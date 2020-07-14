import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { SignUpRequestDto } from '../dto/sign-up-request.dto';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { Some } from 'optional-typescript';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalUserService } from './portal-user.service';
import { Membership } from '../domain/entity/membership.entity';
import { LoginDto } from '../dto/auth/login.dto';
import { EventBus } from '@nestjs/cqrs';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { NewAccountSignUpEvent } from '../event/new-account-sign-up.event';
import { TokenExpiredError } from 'jsonwebtoken';
import { IllegalArgumentException } from '../exception/IllegalArgumentException';

@Injectable()
export class AuthenticationService {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              private readonly connection: Connection,
              private readonly portalUserService: PortalUserService,
              private readonly portalAccountService: PortalAccountService,
              private readonly eventBus: EventBus) {

  }

  public signUpUser(signUpRequestDto: SignUpRequestDto): Promise<PortalUser> {

    return this.connection.transaction(async (entityManager) => {
      const accountName = signUpRequestDto.associationName ?? `${signUpRequestDto.email}`;

      let portalAccount = new PortalAccount();
      portalAccount.name = accountName;
      portalAccount.type = PortalAccountTypeConstant.INDIVIDUAL;
      if (Some<string>(signUpRequestDto.associationName).hasValue) {
        portalAccount.type = PortalAccountTypeConstant.ASSOCIATION;
      }

      portalAccount = await this.portalAccountService.createPortalAccount(entityManager, portalAccount);
      portalAccount.status = GenericStatusConstant.IN_ACTIVE;
      await entityManager.save(portalAccount);

      const portalUser = new PortalUser();
      portalUser.firstName = signUpRequestDto.firstName;
      portalUser.lastName = signUpRequestDto.lastName;
      portalUser.username = signUpRequestDto.email.toLowerCase();
      portalUser.password = signUpRequestDto.password;
      portalUser.email = signUpRequestDto.email.toLowerCase();
      portalUser.phoneNumber = signUpRequestDto.phoneNumber;
      portalUser.status = GenericStatusConstant.IN_ACTIVE;
      await this.portalUserService.createPortalUser(entityManager, portalUser);

      const membership = new Membership();
      membership.portalUser = portalUser;
      membership.portalAccount = portalAccount;
      membership.status = GenericStatusConstant.IN_ACTIVE;
      await entityManager.save(membership);

      delete portalUser.password;
      this.eventBus.publish(new NewAccountSignUpEvent(portalAccount));
      return portalUser;
    });
  }


  public verifyUserBearerToken(bearerToken: string, userStatus: GenericStatusConstant = GenericStatusConstant.ACTIVE): Promise<PortalUser> {
    return this.authenticationUtils
      .verifyBearerToken(bearerToken)
      .then((decoded: { sub: string }) => {
        return this.connection.getCustomRepository(PortalUserRepository).findOneItem({
          id: Number(decoded.sub),
        }, GenericStatusConstant.IN_ACTIVE);
      }).then((portalUser: PortalUser) => {
        if (!portalUser) {
          throw new UnauthorizedException('User is not active');
        }
        delete portalUser.password;
        return Promise.resolve(portalUser);
      }).catch((error) => {
        if (error instanceof TokenExpiredError) {
          const tokenError = error as TokenExpiredError;
          throw new IllegalArgumentException(tokenError.message);
        }
        if (error instanceof UnauthorizedException) {
          throw new IllegalArgumentException('Portal user is not authorised to login');
        }
        console.log(error);
        throw  error;
      });
  }

  public async loginUser(loginDto: LoginDto): Promise<string> {

    return this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumber(loginDto.username)
      .then(async portalUserValue => {
        if (portalUserValue) {
          const isTrue = await this.authenticationUtils
            .comparePassword(loginDto.password, portalUserValue.password);
          if (isTrue) {
            const token = await this.authenticationUtils.generateToken(portalUserValue.id);
            return Promise.resolve(token);
          }
        }
        throw new UnauthorizedException('Username or password is incorrect');
      });

  }

}
