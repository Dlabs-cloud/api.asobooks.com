import { Inject, Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { BEARER_TOKEN_SERVICE, IBearerTokenService } from '../dlabs-nest-starter/interfaces/i-bearer-token-service';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';

@Injectable()
export class ValidationService implements IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto> {

  constructor(@Inject(BEARER_TOKEN_SERVICE) private readonly bearerTokenService: IBearerTokenService<TokenPayloadDto>) {
  }

  public async createCallBackToken(receiver: PortalUser, type: TokenTypeConstant, portalAccount?: PortalAccount): Promise<string> {
    const payload: TokenPayloadDto = {
      portalUser: receiver,
      portalAccount: portalAccount,
    };
    const token = await this.bearerTokenService.generateBearerToken(payload, type);
    return Buffer.from(token).toString('base64');
  }

  public async validateEmailCallBackToken(token: string, type: TokenTypeConstant): Promise<TokenPayloadDto> {
    let generatedToken = Buffer.from(token, 'base64').toString();
    return this.bearerTokenService.verifyBearerToken(generatedToken, type);
  }
}