import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/auth/request/sign-up.dto';
import { AuthenticationService } from '../service-impl/authentication.service';
import { Public } from '../dlabs-nest-starter/security/annotations/public';
import { LoginDto } from '../dto/auth/request/login.dto';
import { LoginResponseDto } from '../dto/auth/response/login-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ChangePasswordDto } from '../dto/auth/request/change-password.dto';
import { PasswordResetDto } from '../dto/auth/request/password-reset.dto';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { UserManagementService } from '../service-impl/user-management.service';
import { Connection } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { InvalidtokenException } from '../exception/invalidtoken.exception';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { LoggedInUserInfoHandler } from './handlers/logged-in-user-info.handler';
import { ProfileUpdateDto } from '../dto/profile-update.dto';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';

@Controller()
export class AuthenticationController {

  constructor(private readonly authenticationService: AuthenticationService,
              private readonly userManagementService: UserManagementService,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>,
              private readonly connection: Connection,
              private readonly loggedInUserInfoHandler: LoggedInUserInfoHandler) {
  }


  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpRequestDto: SignUpDto) {
    const existingIngPortalUser = await this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndNotDeleted(signUpRequestDto.email.toLowerCase());

    if (existingIngPortalUser) {
      throw new IllegalArgumentException('portal user with email or user name is already existing');
    }

    const membership = await this.authenticationService.signPrincipalUser(signUpRequestDto);
    return new ApiResponseDto(membership.portalUser, 201);
  }

  @Public()
  @Get('/validate-principal/:token')
  public async principalSetUp(@Param('token') token: string) {

    const payload: TokenPayloadDto = await this.emailValidationService
      .validateEmailCallBackToken(token, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP);
    if (!payload.portalAccount) {
      throw new InvalidtokenException('Token is not valid');
    }
    await this.userManagementService.validatePrincipalUser(payload.portalUser, payload.portalAccount);
    return new ApiResponseDto();
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authenticationService.loginUser(loginDto)
      .then(userInfo => {
        return this.loggedInUserInfoHandler.transform(userInfo.portalUser)
          .then(transformedObject => {
            const loginResponseDto = new LoginResponseDto();
            loginResponseDto.token = userInfo.token;
            loginResponseDto.userInfo = transformedObject;
            return Promise.resolve(new ApiResponseDto(loginResponseDto, 200));
          });
      });
  }


  @Public()
  @Post('/password/reset/:token')
  public async onPasswordReset(@Param('token') token: string,
                               @Body() passwordResetDto: ChangePasswordDto) {
    let payload = await this.emailValidationService.validateEmailCallBackToken(token, TokenTypeConstant.FORGOT_PASSWORD);

    await this.userManagementService.changePortalUserPassword(payload.portalUser, passwordResetDto);
    return new ApiResponseDto();
  }

  @Public()
  @Post('/password/reset')
  public async passwordReset(@Body() passwordResetDto: PasswordResetDto) {
    return this.connection
      .getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(passwordResetDto.email, GenericStatusConstant.ACTIVE, GenericStatusConstant.IN_ACTIVE, GenericStatusConstant.PENDING_ACTIVATION)
      .then(portalUser => {
        return this.userManagementService.resetPassword(portalUser).then(portalUser => {
          return Promise.resolve(new ApiResponseDto(null, 200, 'A reset link will been sent to the email if its exists'));
        });
      });
  }


  @Get('/me')
  public async me(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    let response = await this.loggedInUserInfoHandler.transform(requestPrincipal.portalUser);
    return new ApiResponseDto(response);
  }


  @Patch('/me')
  public updateProfile(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                       @Body() request: ProfileUpdateDto) {

    return this.userManagementService
      .updateProfile(requestPrincipal.portalUser, request)
      .then(portalUser => {
        return this.loggedInUserInfoHandler
          .transform(portalUser)
          .then(transformed => {
            return new ApiResponseDto(transformed);
          });
      });
  }

  @Public()
  @Post('/validate-principal')
  public async sendVerificationToken(@Body() passwordResetDto: PasswordResetDto) {
    let portalUser = await this.connection
      .getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(passwordResetDto.email, GenericStatusConstant.PENDING_ACTIVATION);

    if (portalUser) {
      return this.authenticationService.sendPrincipalVerificationEmail(portalUser).then(response => {
        return new ApiResponseDto();
      });
    }
    throw new IllegalArgumentException('Pending account does not exist');
  }

}
