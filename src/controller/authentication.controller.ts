import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

@Public()
@Controller()
export class AuthenticationController {

  constructor(private readonly authenticationService: AuthenticationService,
              private readonly userManagementService: UserManagementService,
              private readonly connection: Connection) {
  }


  @Post('sign-up')
  async signUp(@Body() signUpRequestDto: SignUpDto) {
    const portalUser = await this.authenticationService.signUpUser(signUpRequestDto);
    return new ApiResponseDto(portalUser, 201);
  }

  @Get('/validate-principal/:token')
  public async principalSetUp(@Param('token') token: string) {
    await this.userManagementService.validatePrincipalUser(token);
    return new ApiResponseDto();
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authenticationService.loginUser(loginDto);
    const loginResponseDto = new LoginResponseDto();
    loginResponseDto.token = token;
    return new ApiResponseDto(loginResponseDto, 200);
  }


  @Post('/password/reset/:token')
  public async onPasswordReset(@Param('token') token: string,
                               @Body() passwordResetDto: ChangePasswordDto) {
    await this.userManagementService.changePassword(token, passwordResetDto);
    return new ApiResponseDto();
  }

  @Post('/password/reset')
  public async passwordReset(@Body() passwordResetDto: PasswordResetDto) {
    let portalUser = await this.connection
      .getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndStatus(passwordResetDto.email, GenericStatusConstant.ACTIVE, GenericStatusConstant.PENDING);
    if (portalUser) {
      await this.userManagementService.resetPassword(portalUser);
    }
    return new ApiResponseDto(null, 200, 'A reset link will been sent to the email if its exists');
  }
}