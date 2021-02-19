import { BaseRepository } from '../common/BaseRepository';
import { MembershipRole } from '../domain/entity/membership-role.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(MembershipRole)
export class MembershipRoleRepository extends BaseRepository<MembershipRole> {

}