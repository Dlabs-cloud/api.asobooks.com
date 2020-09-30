import { TokenTypeConstant } from '../../domain/enums/token-type-constant';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { TokenPayloadDto } from '../../dto/token-payload.dto';
import { JwtPayloadDto } from '../../dto/jwt-payload.dto';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { BaseEntity } from '../../common/base.entity';

export const BEARER_TOKEN_SERVICE: string = 'BEARER_TOKEN_SERVICE';

export interface IBearerTokenService<T> {
  verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant): Promise<T>;

  generateBearerToken(payload: T, type: TokenTypeConstant): Promise<string>;
}

// Convert this to an adapter so that it can be easy for modularization