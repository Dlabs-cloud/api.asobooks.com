import { GenderConstant } from '../domain/enums/gender-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';

export class PortalUserDto {
  firstName: string;
  lastName: string;
  username?: string;
  gender?: GenderConstant;
  password?: string;
  email: string;
  phoneNumber: string;
  createdBy?: PortalUser;
  dateCreated: Date;
}