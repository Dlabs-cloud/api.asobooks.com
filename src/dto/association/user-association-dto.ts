import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { PortalAccountResponseDto } from '../portal-account-response.dto';


export class UserAssociationDto {
  name: string;
  type: AssociationTypeConstant;
  accounts: PortalAccountResponseDto[];
}