import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';

export class PortalAccountResponseDto {
  name: string;
  accountCode: string;
  type: PortalAccountTypeConstant;
  dateUpdated: Date;
}