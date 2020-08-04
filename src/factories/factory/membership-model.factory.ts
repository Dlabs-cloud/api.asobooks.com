import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Membership } from '../../domain/entity/membership.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { Association } from '../../domain/entity/association.entity';

export class MembershipModelFactory implements FactoryHelper<Membership> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Membership> {
    const membership = new Membership();
    membership.portalUser = await modelFactory.create(PortalUser);
    membership.portalAccount = await modelFactory.create(PortalAccount);
    membership.association = await modelFactory.create(Association);
    membership.code = faker.random.uuid();
    return membership;
  }

}