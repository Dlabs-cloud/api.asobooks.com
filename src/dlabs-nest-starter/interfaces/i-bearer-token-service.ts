import { TokenTypeConstant } from '../../domain/enums/token-type-constant';

export const BEARER_TOKEN_SERVICE: string = 'BEARER_TOKEN_SERVICE';

export interface IBearerTokenService<T> {
  verifyBearerToken(bearerToken: string, tokenType: TokenTypeConstant): Promise<T>;

  generateBearerToken(payload: T, type: TokenTypeConstant): Promise<string>;
}

// Convert this to an adapter so that it can be easy for modularization
