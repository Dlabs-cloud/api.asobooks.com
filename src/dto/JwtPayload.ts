import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';


export interface JwtPayload {
  sub: number,
  email: string,
  subStatus: GenericStatusConstant,
  accountId?: number,
  accountStatus?: GenericStatusConstant,
  type,
}


