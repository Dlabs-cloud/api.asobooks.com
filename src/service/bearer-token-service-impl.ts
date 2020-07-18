import { BearerTokenService } from '../contracts/bearer-token-service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../dto/JwtPayload';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { TokenPayload } from '../dto/TokenPayload';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { Connection } from 'typeorm';
import { InvalidtokenException } from '../exception/invalidtoken.exception';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { TokenExpiredError } from 'jsonwebtoken';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { Some } from 'optional-typescript';
import { PortalUser } from '../domain/entity/portal-user.entity';

@Injectable()
export class BearerTokenServiceImpl implements BearerTokenService<TokenPayload> {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              private readonly connection: Connection) {
  }

  generateBearerToken(payload: TokenPayload, type: TokenTypeConstant): Promise<string> {
    const jwtPayload: JwtPayload = {
      sub: payload.portalUser.id,
      email: payload.portalUser.email,
      subStatus: payload.portalUser.status,
      accountId: payload.portalAccount?.id,
      accountStatus: payload.portalAccount?.status,
      type,
    };
    return this.authenticationUtils.generateGenericToken(jwtPayload);
  }


  async verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant): Promise<TokenPayload> {
    try {
      let bearerTokenPayload: JwtPayload = (await this.authenticationUtils.verifyBearerToken(bearerToken)) as JwtPayload;
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
      const tokenPayload: TokenPayload = {
        portalUser: portalUser,
      };

      if (Some(portalAccountId).hasValue) {
        const portalAccount = await this.connection
          .getCustomRepository(PortalAccountRepository)
          .findOneItem({
            id: portalAccountId,
          }, accountStatus);

        Some(portalAccount).ifNone(() => {
          throw new InvalidtokenException('Invalid token');
        });
        tokenPayload.portalAccount = portalAccount;
      }
      return tokenPayload;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw new InvalidtokenException('Token is not valid');
      }
      throw  e;
    }

  }

}