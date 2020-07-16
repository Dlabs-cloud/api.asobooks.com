import { PortalUser } from '../../domain/entity/portal-user.entity';
import { Column } from 'typeorm';
import { GenderConstant } from '../../domain/enums/gender-constant';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';

export class UserUpdateDto {
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  status: GenericStatusConstant;
}