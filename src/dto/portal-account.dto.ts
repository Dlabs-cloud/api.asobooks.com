import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Association } from '../domain/entity/association.entity';

export class PortalAccountDto {
  name: string;
  type: PortalAccountTypeConstant;
  association: Association;

}