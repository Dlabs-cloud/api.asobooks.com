import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';

export class AssociationMemberQueryDto {
  limit: number;
  offset: number;
  accountType: PortalAccountTypeConstant;
}