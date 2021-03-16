import { AddressDto } from '../address.dto';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { BankInfoDto } from '../bank-info-dto';

export class AssociationInfoResponse {
  name: string;
  logo: string;
  address: AddressDto;
  type: AssociationTypeConstant;
  accountNumber: string;
  bank: {name, code};
}
