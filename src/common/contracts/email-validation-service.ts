import { BaseEntity } from '../base.entity';

export interface EmailValidationService<T extends BaseEntity> {
  validateCallBackToken(user: T): Promise<string>;

  validateEmailCallBackToken(token: string): Promise<T>;

}