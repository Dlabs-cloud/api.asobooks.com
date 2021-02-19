import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { RoleCodeSequence } from '../core/sequenceGenerators/role-code.sequence';
import { RoleRequest } from '../dto/role.request';
import { Association } from '../domain/entity/association.entity';
import { PermissionRepository } from '../dao/permission.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { Role } from '../domain/entity/role.entity';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { Membership } from '../domain/entity/membership.entity';
import { MembershipRole } from '../domain/entity/membership-role.entity';
import { MembershipRoleRepository } from '../dao/membership-role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly connection: Connection,
              private readonly roleCodeSequence: RoleCodeSequence) {
  }

  createRole(roleRequest: RoleRequest, association: Association) {
    return this.connection.transaction(entityManager => {
      return entityManager.getCustomRepository(PermissionRepository)
        .findByCode(GenericStatusConstant.ACTIVE, ...roleRequest.permissions)
        .then(permissions => {
          if (!permissions.length) {
            throw new IllegalArgumentException('At valid permissions code must be provided');
          }
          return this.roleCodeSequence.next().then(code => {
            const role = new Role();
            role.name = roleRequest.name;
            role.code = code;
            role.association = association;
            return entityManager.save(role);
          }).then(role => {
            const rolePermissionPromise = permissions.map(permission => {
              const rolePermission = new RolePermission();
              rolePermission.permission = permission;
              rolePermission.role = role;
              rolePermission.association = association;
              return entityManager.save(rolePermission);
            });
            return Promise.all(rolePermissionPromise).then(() => {
              return Promise.resolve(role);
            });
          });

        });
    });
  }


  assignMemberships(role: Role, memberships: Membership[]) {
    return this.connection.transaction(em => {
      const membershipRoles = memberships.map(membership => {
        const membershipRole = new MembershipRole();
        membershipRole.membership = membership;
        membershipRole.role = role;
        return em.save(membershipRole);
      });
      return Promise.all(membershipRoles);
    });
  }

  removeMember(role: Role, membership: Membership) {
    return this.connection
      .getCustomRepository(MembershipRoleRepository)
      .findOne({
        role, membership, status: GenericStatusConstant.ACTIVE,
      }).then(membershipRole => {
        if (!membershipRole) {
          return Promise.resolve();
        }
        membershipRole.status = GenericStatusConstant.DELETED;
        return membershipRole.save().then(() => Promise.resolve());
      });
  }

  deleteRole(role: Role) {
    role.status = GenericStatusConstant.IN_ACTIVE;
    return role.save().then(() => Promise.resolve());

  }
}