import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';

export class UserUpdateDto {
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  status: GenericStatusConstant;
}