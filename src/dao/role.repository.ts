import { EntityRepository } from 'typeorm';
import { Role } from '../domain/entity/role.entity';
import { BaseRepository } from '../common/BaseRepository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { MembershipRole } from '../domain/entity/membership-role.entity';
import { Membership } from '../domain/entity/membership.entity';

@EntityRepository(Role)
export class RoleRepository extends BaseRepository<Role> {


}
