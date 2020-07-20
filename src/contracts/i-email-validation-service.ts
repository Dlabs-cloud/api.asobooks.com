import { BaseEntity } from '../common/base.entity';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { TokenPayloadDto } from '../dto/token-payload.dto';

export interface IEmailValidationService<T extends BaseEntity, DATA, PAYLOAD> {
  createCallBackToken(receiver: T, type: TokenTypeConstant, payload?: DATA): Promise<string>

  validateEmailCallBackToken(token: string, type: TokenTypeConstant): Promise<PAYLOAD>

}