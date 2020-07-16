import { Inject, Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { EmailValidationService } from '../contracts/email-validation-service';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { BEARER_TOKEN_SERVICE, BearerTokenService } from '../contracts/bearer-token-service';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayload } from '../dto/TokenPayload';
import { JwtPayload } from '../dto/JwtPayload';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';

@Injectable()
export class ValidationService implements EmailValidationService<PortalUser, PortalAccount, TokenPayload> {

  constructor(@Inject(BEARER_TOKEN_SERVICE) private readonly bearerTokenService: BearerTokenService) {
  }

  public async createCallBackToken(portalUser: PortalUser, type: TokenTypeConstant, portalAccount?: PortalAccount): Promise<string> {
    const payload: JwtPayload = {
      sub: portalUser.id,
      portalAccountId: portalAccount?.id,
      type,
    };
    const token = await this.bearerTokenService.generateBearerToken(payload);
    return Buffer.from(token).toString('base64');
  }

  public async validateEmailCallBackToken(token: string, type: TokenTypeConstant): Promise<TokenPayload> {
    let generatedToken = Buffer.from(token, 'base64').toString();
    return this.bearerTokenService.verifyBearerToken(generatedToken, type, GenericStatusConstant.PENDING, GenericStatusConstant.IN_ACTIVE);
  }
}