import { IsEntityExist } from '../common/class-validators/entity-constraint.validator';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class RoleMembershipRequestDto {
  @IsString({ message: 'Role code must be provided' })
  @IsEntityExist({
    column: 'code',
    isExist: true,
    name: 'role',
  }, {
    message: 'Role code does not exist',
  })
  role: string;

  @ArrayNotEmpty()
  @IsArray()
  membershipReference: string[];
}