import { GenderConstant } from '../domain/enums/gender-constant';

export class PortalUserDto {
  firstName: string;
  lastName: string;
  username?: string;
  gender?: GenderConstant;
  password: string;
  email: string;
  phoneNumber: string;
}