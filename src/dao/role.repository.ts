import { EntityRepository } from 'typeorm';
import { Role } from '../domain/entity/role.entity';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';

@EntityRepository(Role)
export class RoleRepository extends BaseRepository<Role> {

}
