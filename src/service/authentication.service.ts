import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { SignUpDto } from '../dto/auth/request/sign-up.dto';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { Some } from 'optional-typescript';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalUserService } from './portal-user.service';
import { Membership } from '../domain/entity/membership.entity';
import { LoginDto } from '../dto/auth/request/login.dto';
import { EventBus } from '@nestjs/cqrs';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { NewUserAccountSignUpEvent } from '../event/new-user-account-sign-up.event';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { JwtPayload } from '../dto/JwtPayload';
import { BEARER_TOKEN_SERVICE, BearerTokenService } from '../contracts/bearer-token-service';
import { TokenPayload } from '../dto/TokenPayload';

@Injectable()
export class AuthenticationService {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              @Inject(BEARER_TOKEN_SERVICE) private readonly bearerTokenService: BearerTokenService<TokenPayload>,
              private readonly connection: Connection,
              private readonly portalUserService: PortalUserService,
              private readonly portalAccountService: PortalAccountService,
              private readonly eventBus: EventBus) {

  }

  public signUpUser(signUpRequestDto: SignUpDto): Promise<PortalUser> {

    return this.connection.transaction(async (entityManager) => {
      const accountName = signUpRequestDto.associationName ?? `${signUpRequestDto.email}`;

      let portalAccount = new PortalAccount();
      portalAccount.name = accountName;
      portalAccount.type = PortalAccountTypeConstant.INDIVIDUAL;
      Some(signUpRequestDto.associationName).ifPresent((value) => {
        portalAccount.type = PortalAccountTypeConstant.ASSOCIATION;
      });
      portalAccount = await this.portalAccountService.createPortalAccount(entityManager, portalAccount);
      portalAccount.status = GenericStatusConstant.PENDING_ACTIVATION;
      await entityManager.save(portalAccount);

      const portalUser = new PortalUser();
      portalUser.firstName = signUpRequestDto.firstName;
      portalUser.lastName = signUpRequestDto.lastName;
      portalUser.username = signUpRequestDto.email.toLowerCase();
      portalUser.password = signUpRequestDto.password;
      portalUser.email = signUpRequestDto.email.toLowerCase();
      portalUser.phoneNumber = signUpRequestDto.phoneNumber;
      portalUser.status = GenericStatusConstant.PENDING_ACTIVATION;
      await this.portalUserService.createPortalUser(entityManager, portalUser);

      const membership = new Membership();
      membership.portalUser = portalUser;
      membership.portalAccount = portalAccount;
      membership.status = GenericStatusConstant.PENDING_ACTIVATION;
      await entityManager.save(membership);

      delete portalUser.password;

      this.eventBus.publish(new NewUserAccountSignUpEvent(portalAccount, portalUser));
      return portalUser;
    });
  }


  public async loginUser(loginDto: LoginDto): Promise<string> {

    return this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(loginDto.username, GenericStatusConstant.ACTIVE)
      .then(async portalUserValue => {
        if (portalUserValue) {
          const isTrue = await this.authenticationUtils
            .comparePassword(loginDto.password, portalUserValue.password);
          if (isTrue) {
            const payload: TokenPayload = {
              portalUser: portalUserValue,
            };
            const token = this.bearerTokenService.generateBearerToken(payload, TokenTypeConstant.LOGIN);
            return Promise.resolve(token);
          }
        }
        throw new UnauthorizedException('Username or password is incorrect');
      });

  }

}
