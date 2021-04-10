import { GenderConstant } from '../domain/enums/gender-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { AddressDto } from './address.dto';

export class PortalUserDto {
  firstName: string;
  lastName: string;
  username?: string;
  gender?: GenderConstant;
  password?: string;
  email: string;
  phoneNumber: string;
  createdBy?: PortalUser;
  identifier?: string;
  dateCreated?: Date;
  accounts?: PortalAccountTypeConstant[];
  address?: AddressDto;
  role?: {
    name: string,
    code: string
  };
}
