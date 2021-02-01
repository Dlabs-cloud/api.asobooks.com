import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { MembershipInfo } from '../../domain/entity/association-member-info.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Address } from '../../domain/entity/address.entity';
import { Association } from '../../domain/entity/association.entity';
import { PortalUser } from '../../domain/entity/portal-user.entity';

export class MembershipInfoFactory implements FactoryHelper<MembershipInfo> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<MembershipInfo> {
    const membershipInfo = new MembershipInfo();
    membershipInfo.identifier = faker.random.uuid() + faker.random.alphaNumeric();
    membershipInfo.address = await modelFactory.create(Address);
    membershipInfo.association = await modelFactory.create(Association);
    membershipInfo.portalUser = await modelFactory.create(PortalUser);
    return membershipInfo;
  }

}