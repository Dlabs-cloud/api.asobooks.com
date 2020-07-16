import { BaseEntity } from '../common/base.entity';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { TokenPayload } from '../dto/TokenPayload';

export interface EmailValidationService<T extends BaseEntity, DATA, PAYLOAD> {
  createCallBackToken(portalUser: T, type: TokenTypeConstant, payload?: DATA): Promise<string>

  validateEmailCallBackToken(token: string, type: TokenTypeConstant): Promise<PAYLOAD>

}