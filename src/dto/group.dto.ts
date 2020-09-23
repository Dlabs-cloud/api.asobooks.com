import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { Association } from '../domain/entity/association.entity';

export class GroupDto {
  name: string;
  type: GroupTypeConstant;
  association: Association;
}