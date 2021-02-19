import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { Role } from '../../domain/entity/role.entity';
import { PermissionRepository } from '../../dao/permission.repository';
import { RolePermissionResponse } from '../../dto/role-permission.response';

@Injectable()
export class RoleHandler {

  constructor(private readonly connection: Connection) {
  }

  transform(role: Role) {
    return this.connection.getCustomRepository(PermissionRepository).findByRole(role).then(permissions => {
      const permissionItems = permissions.map(permission => {
        return {
          name: permission.name,
          code: permission.code,
        };
      });
      const response: RolePermissionResponse = {
        code: role.code, name: role.name, permissions: permissionItems,

      };
      return response;
    });
  }
}