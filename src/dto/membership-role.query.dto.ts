import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { IsEnum } from 'class-validator';

export class MembershipRoleQueryDto {
  @IsEnum(PortalAccountTypeConstant)
  accountType: PortalAccountTypeConstant;
  limit?: number;
  offset?: number;
}
