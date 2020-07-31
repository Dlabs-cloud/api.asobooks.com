import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/auth/request/sign-up.dto';
import { AuthenticationService } from '../service/authentication.service';
import { Public } from '../conf/security/annotations/public';
import { LoginDto } from '../dto/auth/request/login.dto';
import { LoginResponseDto } from '../dto/auth/response/login-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ChangePasswordDto } from '../dto/auth/request/change-password.dto';
import { PasswordResetDto } from '../dto/auth/request/password-reset.dto';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { UserManagementService } from '../service/user-management.service';
import { Connection } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { InvalidtokenException } from '../exception/invalidtoken.exception';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { AssociationRepository } from '../dao/association.repository';
import { PortalUserAccountRepository } from '../dao/portal-user-account.repository';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { LoggedInUserInfoHandler } from './handlers/logged-in-user-info.handler';


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
      .findByUserNameOrEmailOrPhoneNumberAndNotDeleted(signUpRequestDto.email);

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
    const token = await this.authenticationService.loginUser(loginDto);
    const loginResponseDto = new LoginResponseDto();
    loginResponseDto.token = token;
    return new ApiResponseDto(loginResponseDto, 200);
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
    let portalUser = await this.connection
      .getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(passwordResetDto.email, GenericStatusConstant.ACTIVE, GenericStatusConstant.IN_ACTIVE);
    if (portalUser) {
      await this.userManagementService.resetPassword(portalUser);
    }
    return new ApiResponseDto(null, 200, 'A reset link will been sent to the email if its exists');
  }


  @Get('/me')
  public async me(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    let response = await this.loggedInUserInfoHandler.transform(requestPrincipal.portalUser);
    return new ApiResponseDto(response);


  }

}