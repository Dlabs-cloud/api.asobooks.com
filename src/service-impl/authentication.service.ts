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
import { AssociationServiceImpl } from './association.service-impl';
import { AssociationCodeSequence } from '../core/sequenceGenerators/association-code.sequence';
import { MembershipService } from './membership.service';
import { MembershipDto } from '../dto/membership.dto';
import { Membership } from '../domain/entity/membership.entity';
import { PortalAccountDto } from '../dto/portal-account.dto';
import { PortalUserDto } from '../dto/portal-user.dto';
import { UnAuthorizedException } from '../exception/unAuthorized.exception';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { InActiveAccountException } from '../exception/in-active-account.exception';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { MembershipInfoService } from './membership-info.service';
import { MembershipCodeSequence } from '../core/sequenceGenerators/membership-code.sequence';
import { tsconfigPathsBeforeHookFactory } from '@nestjs/cli/lib/compiler/hooks/tsconfig-paths.hook';

@Injectable()
export class AuthenticationService {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              @Inject(BEARER_TOKEN_SERVICE) private readonly bearerTokenService: IBearerTokenService<TokenPayloadDto>,
              private readonly connection: Connection,
              private readonly portalUserService: PortalUserService,
              private readonly associationService: AssociationServiceImpl,
              private readonly associationCodeSequence: AssociationCodeSequence,
              private readonly membershipService: MembershipService,
              private readonly portalAccountService: PortalAccountService,
              private readonly membershipCodeSequence: MembershipCodeSequence,
              private readonly membershipInfoService: MembershipInfoService,
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

      accountName = `${accountName} Executive Account`;

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
        identifier: '',
        phoneNumber: signUpRequestDto.phoneNumber,
      };

      const portalUser = await this.portalUserService.createPortalUser(entityManager, portalUserDto, GenericStatusConstant.PENDING_ACTIVATION);

      const membershipInfo = await this.membershipCodeSequence.next().then(code => {
        return this.membershipInfoService.createMembershipInfo(entityManager, portalUser, association, null, code);
      });
      const membershipDto: MembershipDto = {
        association,
        portalAccount: executivePortalAccount,
        membershipInfo,
        portalUser,
      };
      const membership = await this.membershipService.createMembership(entityManager, membershipDto, GenericStatusConstant.PENDING_ACTIVATION);

      delete portalUser.password;

      portalUserDto.identifier = membershipInfo.identifier;
      this.eventBus.publish(new NewUserAccountSignUpEvent(executivePortalAccount, portalUser));
      return membership;
    });
  }


  public async loginUser(loginDto: LoginDto) {

    return this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(loginDto.username.toLowerCase(), GenericStatusConstant.ACTIVE, GenericStatusConstant.PENDING_ACTIVATION)
      .then(async portalUser => {
        if (portalUser) {
          if (portalUser.status === GenericStatusConstant.PENDING_ACTIVATION) {
            throw  new InActiveAccountException('Portal Account not verified');
          }
          const isTrue = await this.authenticationUtils
            .comparePassword(loginDto.password, portalUser.password);
          if (isTrue) {
            const payload: TokenPayloadDto = {
              portalUser: portalUser,
            };
            const token = await this.bearerTokenService.generateBearerToken(payload, TokenTypeConstant.LOGIN);
            return Promise.resolve({ token, portalUser });
          }
        }

        throw  new UnAuthorizedException('Username or password is incorrect');
      });

  }

  public sendPrincipalVerificationEmail(portalUser: PortalUser) {
    return this.connection.getCustomRepository(PortalAccountRepository).findFirstByPortalUserAndStatus(portalUser, false, GenericStatusConstant.PENDING_ACTIVATION)
      .then(async portalAccount => {
        if (portalAccount) {
          this.eventBus.publish(new NewUserAccountSignUpEvent(portalAccount, portalUser));
          return portalUser;
        }
        throw new IllegalArgumentException('Portal account not found');
      });
  }
}
