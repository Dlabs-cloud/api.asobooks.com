import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { GroupMembership } from '../../domain/entity/group-membership.entity';
import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Membership } from '../../domain/entity/membership.entity';
import { Group } from '../../domain/entity/group.entity';

export class GroupMembershipModelFactory implements FactoryHelper<GroupMembership> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<GroupMembership> {
    let membershipGroup = new GroupMembership();
    membershipGroup.membership = await modelFactory.create(Membership);
    membershipGroup.group = await modelFactory.create(Group);
    return membershipGroup;
  };


}