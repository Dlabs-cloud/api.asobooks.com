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

@Injectable()
export class BearerTokenServiceImpl implements BearerTokenService {

  constructor(private readonly authenticationUtils: AuthenticationUtils,
              private readonly connection: Connection) {
  }

  generateBearerToken(payload: JwtPayload): Promise<string> {
    return this.authenticationUtils.generateGenericToken(payload);
  }

  async verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant, ...status: GenericStatusConstant[]): Promise<TokenPayload> {
    try {
      let bearerTokenPayload: JwtPayload = (await this.authenticationUtils.verifyBearerToken(bearerToken)) as JwtPayload;
      const portalUserId = bearerTokenPayload.sub;
      const portalAccountId = bearerTokenPayload.portalAccountId;
      const portalUser = await this.connection
        .getCustomRepository(PortalUserRepository)
        .findByIdAndStatus(portalUserId, ...status);
      if (!portalUser) {
        throw new InvalidtokenException('Token is not valid');
      }
      const tokenPayload: TokenPayload = {
        portalUser: portalUser,
      };


      if (Some(portalAccountId).hasValue) {
        tokenPayload.portalAccount = await this.connection
          .getCustomRepository(PortalAccountRepository)
          .findOneItem({
            id: portalAccountId,
          }, ...status);
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