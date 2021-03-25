import { BaseRepository } from '../common/BaseRepository';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { EntityRepository } from 'typeorm';
import { Role } from '../domain/entity/role.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(RolePermission)
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  findByRoles(roles: Role[], status = GenericStatusConstant.ACTIVE) {
    const roleIds = roles.map(role => role.id);
    return this.createQueryBuilder('rolePermission')
      .innerJoinAndSelect('rolePermission.permission', 'permission')
      .innerJoinAndSelect('rolePermission.role', 'role')
      .where('rolePermission.status = :status', { status })
      .andWhere('permission.status = :status', { status })
      .andWhere('role.id IN (:...roleIds)', { roleIds: roleIds })
      .getMany();
  }
}
