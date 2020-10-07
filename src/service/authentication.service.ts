import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { SignUpDto } from '../dto/auth/request/sign-up.dto';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalUserService } from './portal-user.service';
import { LoginDto } from '../dto/auth/request/login.dto';
import { EventBus } from '@nestjs/cqrs';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { NewUserAccountSignUpEvent } from '../event/new-user-account-sign-up.event';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { BEARER_TOKEN_SERVICE, IBearerTokenService } from '../dlabs-nest-starter/interfaces/i-bearer-token-service';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { Association } from '../domain/entity/association.entity';
import { AssociationService } from './association.service';
import { AssociationCodeSequence } from '../core/sequenceGenerators/association-code.sequence';
import { MembershipService } from './membership.service';
import { MembershipDto } from '../dto/membership.dto';
import { Membership } from '../domain/entity/membership.entity';
import { PortalAccountDto } from '../dto/portal-account.dto';
import { PortalUserDto } from '../dto/portal-user.dto';
import { UnAuthorizedException } from '../exception/unAuthorized.exception';

@Injectable()
export class AuthenticationService {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              @Inject(BEARER_TOKEN_SERVICE) private readonly bearerTokenService: IBearerTokenService<TokenPayloadDto>,
              private readonly connection: Connection,
              private readonly portalUserService: PortalUserService,
              private readonly associationService: AssociationService,
              private readonly associationCodeSequence: AssociationCodeSequence,
              private readonly membershipService: MembershipService,
              private readonly portalAccountService: PortalAccountService,
              private readonly eventBus: EventBus) {

  }

  public signPrincipalUser(signUpRequestDto: SignUpDto): Promise<Membership> {

    return this.connection.transaction(async (entityManager) => {


      let association = new Association();
      association.name = signUpRequestDto.associationName;
      association.status = GenericStatusConstant.PENDING_ACTIVATION;
      association.code = await this.associationCodeSequence.next();

      await entityManager.save(association);


      let accountName = signUpRequestDto.associationName ?? `${signUpRequestDto.email}`;

      accountName = `${accountName} Excos Account`;

      let executivePortalAccountDto: PortalAccountDto = {
        name: accountName,
        association,
        type: PortalAccountTypeConstant.EXECUTIVE_ACCOUNT,
      };
      let executivePortalAccount = await this
        .portalAccountService
        .createPortalAccount(entityManager, executivePortalAccountDto, GenericStatusConstant.PENDING_ACTIVATION);

      const portalUserDto: PortalUserDto = {
        email: signUpRequestDto.email,
        firstName: signUpRequestDto.firstName,
        lastName: signUpRequestDto.lastName,
        password: signUpRequestDto.password,
        phoneNumber: signUpRequestDto.phoneNumber,
      };

      const portalUser = await this.portalUserService.createPortalUser(entityManager, portalUserDto, GenericStatusConstant.PENDING_ACTIVATION);


      const membershipDto: MembershipDto = {
        association,
        portalAccount: executivePortalAccount,
        portalUser,

      };
      const membership = await this.membershipService.createMembership(entityManager, membershipDto, GenericStatusConstant.PENDING_ACTIVATION);

      delete portalUser.password;

      this.eventBus.publish(new NewUserAccountSignUpEvent(executivePortalAccount, portalUser));
      return membership;
    });
  }


  public async loginUser(loginDto: LoginDto): Promise<string> {

    return this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(loginDto.username.toLowerCase(), GenericStatusConstant.ACTIVE)
      .then(async portalUserValue => {
        if (portalUserValue) {
          const isTrue = await this.authenticationUtils
            .comparePassword(loginDto.password, portalUserValue.password);
          if (isTrue) {
            const payload: TokenPayloadDto = {
              portalUser: portalUserValue,
            };
            const token = this.bearerTokenService.generateBearerToken(payload, TokenTypeConstant.LOGIN);
            return Promise.resolve(token);
          }
        }
        throw  new UnAuthorizedException('Username or password is incorrect');
      });

  }

}
