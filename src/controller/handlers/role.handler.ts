import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { Role } from '../../domain/entity/role.entity';
import { PermissionRepository } from '../../dao/permission.repository';
import { RolePermissionResponse } from '../../dto/role-permission.response';
import { RolePermissionRepository } from '../../dao/role-permission.repository';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';

@Injectable()
export class RoleHandler {

  constructor(private readonly connection: Connection) {
  }

  transform(role: Role) {
    const permissionRepository = this.connection.getCustomRepository(PermissionRepository);
    return permissionRepository.findByRole(role).then(permissions => {
      return permissions.map(permission => {
        return {
          name: permission.name,
          code: permission.code,
        };
      });

    });

  }

  async transformRoles(roles: Role[]) {
    if (!roles || !roles.length) {
      return [];
    }
    const permissions = await this.connection.getCustomRepository(PermissionRepository)
      .find({ status: GenericStatusConstant.ACTIVE });
    const rolePermissions = await this.connection
      .getCustomRepository(RolePermissionRepository)
      .findByRoles(roles);
    return roles.map(role => {
      const _ = permissions.map(permission => {
        const isExists = !!rolePermissions
          .find(rolePermission => rolePermission.role.equals(role) && rolePermission.permission.equals(permission));
        return {
          name: permission.name,
          code: permission.code,
          exist: isExists,
        };
      });
      return {
        name: role.name,
        code: role.code,
        permissions: _,
      };
    });

  }
}
