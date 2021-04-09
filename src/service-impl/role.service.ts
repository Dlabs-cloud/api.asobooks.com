import { ForbiddenException, Injectable } from '@nestjs/common';
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
import { RolePermissionRepository } from '../dao/role-permission.repository';
import { RoleRepository } from '../dao/role.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(private readonly connection: Connection,
              private readonly roleCodeSequence: RoleCodeSequence) {
  }

  createRole(roleRequest: RoleRequest, association: Association) {
    return this.connection.transaction(entityManager => {
      return entityManager.getCustomRepository(RoleRepository).findOne({
        name: roleRequest.name,
        association,
      }).then(role => {
        if (role) {
          throw new ForbiddenException(`Role with name ${roleRequest.name} already exists`);
        }
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
                return entityManager.save(rolePermission);
              });
              return Promise.all(rolePermissionPromise).then(() => {
                return Promise.resolve(role);
              });
            });

          });
      });
    });
  }


  assignMemberships(role: Role, memberships: Membership[]) {
    return this.connection.transaction(em => {
      const membershipRoles = memberships.map(membership => {
        return this.createRoleMember(em, membership, role);
      });
      return Promise.all(membershipRoles);
    });
  }


  public createRoleMember(em: EntityManager, membership: Membership, role: Role) {
    const membershipRole = new MembershipRole();
    membershipRole.membership = membership;
    membershipRole.role = role;
    return em.save(membershipRole);
  }

  removeMember(role: Role, membership: Membership) {
    return this.connection.transaction(em => {
      return this.deActivateMember(em, role, membership);
    });
  }

  deActivateMember(em: EntityManager, role: Role, membership: Membership) {
    return em
      .getCustomRepository(MembershipRoleRepository)
      .findOne({ role, membership })
      .then(membershipRole => {
        if (!membershipRole) {
          return Promise.resolve();
        }
        membershipRole.status = GenericStatusConstant.DELETED;
        return em.save(membershipRole).then(() => Promise.resolve());
      });
  }

  deleteRole(role: Role) {
    return this.connection.transaction(entityManager => {
      role.status = GenericStatusConstant.IN_ACTIVE;
      return entityManager.save(role).then(() => Promise.resolve()).then(_ => {
        return entityManager.getCustomRepository(RolePermissionRepository)
          .find({ role }).then(rolePermissions => {
            rolePermissions = rolePermissions.map(rolePermission => {
              rolePermission.status = GenericStatusConstant.IN_ACTIVE;
              return rolePermission;
            });
            return entityManager.save(rolePermissions);
          });
      });
    });


  }
}
