import { Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { AuthenticationService } from './authentication.service';
import { EmailValidationService } from '../common/contracts/email-validation-service';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@Injectable()
export class ValidationService implements EmailValidationService<PortalUser> {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              private readonly authenticationService: AuthenticationService) {
  }

  public async validateCallBackToken(portalUser: PortalUser): Promise<string> {
    let token = await this.authenticationUtils.generateToken(portalUser.id);
    return Buffer.from(token).toString('base64');
  }

  public async validateEmailCallBackToken(token: string): Promise<PortalUser> {
    let generatedToken = Buffer.from(token, 'base64').toString();
    return this.authenticationService.verifyUserBearerToken(generatedToken, GenericStatusConstant.IN_ACTIVE);
  }
}