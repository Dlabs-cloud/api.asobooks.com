import { EntityRepository } from 'typeorm';
import { Role } from '../domain/entity/role.entity';
import { BaseRepository } from '../common/BaseRepository';

@EntityRepository(Role)
export class RoleRepository extends BaseRepository<Role> {

}