import { BaseRepository } from '../common/BaseRepository';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(RolePermission)
export class RolePermissionRepository extends BaseRepository<RolePermission> {

}