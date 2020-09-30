import { IBearerTokenService } from '../dlabs-nest-starter/interfaces/i-bearer-token-service';
import { Injectable } from '@nestjs/common';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { Connection } from 'typeorm';
import { InvalidtokenException } from '../exception/invalidtoken.exception';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { Some } from 'optional-typescript';


@Injectable()
export class BearerTokenService implements IBearerTokenService<TokenPayloadDto> {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              private readonly connection: Connection) {
  }

  generateBearerToken(payload: TokenPayloadDto, type: TokenTypeConstant): Promise<string> {
    const jwtPayload: JwtPayloadDto = {
      sub: payload.portalUser.id,
      email: payload.portalUser.email,
      subStatus: payload.portalUser.status,
      accountId: payload.portalAccount?.id,
      accountStatus: payload.portalAccount?.status,
      type,
    };
    return this.authenticationUtils.generateGenericToken(jwtPayload);
  }


  async verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant): Promise<TokenPayloadDto> {
    try {
      let bearerTokenPayload: JwtPayloadDto = (await this.authenticationUtils.verifyBearerToken(bearerToken)) as JwtPayloadDto;
      const portalUserId = bearerTokenPayload.sub;
      const portalUserStatus = bearerTokenPayload.subStatus;
      const portalAccountId = bearerTokenPayload.accountId;
      const accountStatus = bearerTokenPayload.accountStatus;
      const type = bearerTokenPayload.type;
      if (type !== tokenType) {
        throw new InvalidtokenException('Token is not valid');
      }
      const portalUser = await this.connection
        .getCustomRepository(PortalUserRepository)
        .findByIdAndStatus(portalUserId, portalUserStatus);
      if (!portalUser) {
        throw new InvalidtokenException('Token is not valid');
      }
      const tokenPayload: TokenPayloadDto = {
        portalUser: portalUser,
      };

      if (Some(portalAccountId).hasValue) {
        const portalAccount = await this.connection
          .getCustomRepository(PortalAccountRepository)
          .findOneItemByStatus({
            id: portalAccountId,
          }, accountStatus);

        Some(portalAccount).ifNone(() => {
          throw new InvalidtokenException('Invalid token');
        });
        tokenPayload.portalAccount = portalAccount;
      }
      return tokenPayload;
    } catch (e) {

      throw new InvalidtokenException('Token is not valid');

    }

  }

}