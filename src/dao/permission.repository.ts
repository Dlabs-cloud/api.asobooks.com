import { BaseRepository } from '../common/BaseRepository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Permission } from '../domain/entity/permission.entity';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Role } from '../domain/entity/role.entity';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { MembershipRole } from '../domain/entity/membership-role.entity';
import { Membership } from '../domain/entity/membership.entity';

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

  findByPortalUser(user: PortalUser, status = GenericStatusConstant.ACTIVE): Promise<{ permissionid: number, portalaccountid: number }[]> {
    return this.createQueryBuilder('permission')
      .distinct()
      .select(['permission.id as permissionId', 'portalAccount.id as portalAccountId'])
      .innerJoin(RolePermission, 'rolePermission', 'rolePermission.permission = permission.id')
      .innerJoin(Role, 'role', 'rolePermission.role = role.id')
      .innerJoin(MembershipRole, 'membershipRole', 'membershipRole.role = role.id')
      .innerJoin(Membership, 'membership', 'membershipRole.membership = membership.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('membership.portalUser = :portalUser', { portalUser: user.id })
      .andWhere('role.status = :status', { status })
      .andWhere('membershipRole.status = :status', { status })
      .andWhere('rolePermission.status = :status', { status })
      .andWhere('permission.status = :status', { status })
      .getRawMany();
  }
}
