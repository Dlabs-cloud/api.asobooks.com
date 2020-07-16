import { TokenTypeConstant } from '../domain/enums/token-type-constant';


export interface JwtPayload {
  sub: number;
  portalAccountId?: number,
  type: TokenTypeConstant
}