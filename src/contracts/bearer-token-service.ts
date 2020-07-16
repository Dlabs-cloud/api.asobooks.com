import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { TokenPayload } from '../dto/TokenPayload';
import { JwtPayload } from '../dto/JwtPayload';

export const BEARER_TOKEN_SERVICE: string = 'BEARER_TOKEN_SERVICE';

export interface BearerTokenService {
  verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant, ...status: GenericStatusConstant[]): Promise<TokenPayload>;

  generateBearerToken(payload: JwtPayload): Promise<string>;
}

// Convert this to an adapter so that it can be easy for modularization