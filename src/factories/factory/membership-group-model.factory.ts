import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { MembershipGroup } from '../../domain/entity/membership-group.entity';
import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Membership } from '../../domain/entity/membership.entity';
import { Group } from '../../domain/entity/group.entity';

export class MembershipGroupModelFactory implements FactoryHelper<MembershipGroup> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<MembershipGroup> {
    let membershipGroup = new MembershipGroup();
    membershipGroup.membership = await modelFactory.create(Membership);
    membershipGroup.group = await modelFactory.create(Group);
    return membershipGroup;
  };


}