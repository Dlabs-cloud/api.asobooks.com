import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { PortalUserAccount } from '../../domain/entity/portal-user-account.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { Association } from '../../domain/entity/association.entity';

export class PortalUserAccountModelFactory implements FactoryHelper<PortalUserAccount> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<PortalUserAccount> {
    const portalUserAccount = new PortalUserAccount();
    portalUserAccount.portalUser = await modelFactory.create(PortalUser);
    portalUserAccount.portalAccount = await modelFactory.create(PortalAccount);
    portalUserAccount.association = await modelFactory.create(Association);
    return portalUserAccount;
  }

}