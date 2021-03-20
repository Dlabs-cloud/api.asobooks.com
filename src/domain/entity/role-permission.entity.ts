import { BaseEntity } from '../../common/base.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Association } from './association.entity';

@Entity()
export class RolePermission extends BaseEntity {
  @ManyToOne(() => Role)
  role: Role;

  @ManyToOne(() => Permission)
  permission: Permission;

}
