import { BaseRepository } from '../common/BaseRepository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Permission } from '../domain/entity/permission.entity';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Permission)
export class PermissionRepository extends BaseRepository<Permission> {
  findByCode(status = GenericStatusConstant.ACTIVE, ...code: string[]) {
    return this.createQueryBuilder('permission')
      .select()
      .where('permission.status = :status', { status: status })
      .andWhere('permission.code IN (:...code)', { code: code })
      .getMany();
  }
}