import { Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class EmailValidationService {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              private readonly authenticationService: AuthenticationService) {
  }

  public async generateCallBackUrl(portalUser: PortalUser) {
    let token = await this.authenticationUtils.generateToken(portalUser.id);
    return btoa(token);
  }

  public async validateEmailCallBackToken(token: string) {
    let generatedToken = atob(token);
    return this.authenticationService.verifyUserBearerToken(generatedToken);
  }
}