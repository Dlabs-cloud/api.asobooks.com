import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { MembershipRole } from '../../domain/entity/membership-role.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Role } from '../../domain/entity/role.entity';
import { Membership } from '../../domain/entity/membership.entity';

export class MembershipRoleFactory implements FactoryHelper<MembershipRole> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<MembershipRole> {
    const membershipRole = new MembershipRole();
    membershipRole.membership = await modelFactory.create(Membership);
    membershipRole.role = await modelFactory.create(Role);
    return membershipRole;
  }

}