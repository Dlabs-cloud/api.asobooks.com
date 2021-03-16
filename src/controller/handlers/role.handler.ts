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

    const permissionRepository = this.connection.getCustomRepository(PermissionRepository);
    return permissionRepository.find().then(allPermissions => {
      return permissionRepository.findByRole(role).then(permissions => {
        return allPermissions.map(allPermission => {
          const exists = permissions.find(permission => permission.id === allPermission.id);
          return {
            name: allPermission.name,
            code: allPermission.code,
            exist: !!exists,
          };
        });
      });
    }).then(_ => {
      return Promise.resolve({
        name: role.name,
        code: role.code,
        permissions: _,
      });
    });
  }
}
