import { IsEntityExist } from '../common/class-validators/entity-constraint.validator';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class RoleMembershipRequestDto {

  @ArrayNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  membershipReferences: string[];
}