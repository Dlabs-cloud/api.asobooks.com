import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { TokenPayload } from '../dto/TokenPayload';
import { JwtPayload } from '../dto/JwtPayload';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { BaseEntity } from '../common/base.entity';

export const BEARER_TOKEN_SERVICE: string = 'BEARER_TOKEN_SERVICE';

export interface BearerTokenService<T> {
  verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant): Promise<T>;

  generateBearerToken(payload: T, type: TokenTypeConstant): Promise<string>;
}

// Convert this to an adapter so that it can be easy for modularization