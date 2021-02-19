import { BaseRepository } from '../common/BaseRepository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Permission } from '../domain/entity/permission.entity';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Role } from '../domain/entity/role.entity';
import { RolePermission } from '../domain/entity/role-permission.entity';

@EntityRepository(Permission)
export class PermissionRepository extends BaseRepository<Permission> {
  findByCode(status = GenericStatusConstant.ACTIVE, ...code: string[]) {
    return this.createQueryBuilder('permission')
      .select()
      .where('permission.status = :status', { status: status })
      .andWhere('permission.code IN (:...code)', { code: code })
      .getMany();
  }

  findByRole(role: Role, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('permission')
      .innerJoin(RolePermission, 'rolePermission', 'rolePermission.permission = permission.id')
      .where('permission.status = :status ', { status })
      .andWhere('rolePermission.role = :role', { role: role.id })
      .andWhere('rolePermission.status = :status', { status })
      .getMany();
  }
}