import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { GenderConstant } from '../../domain/enums/gender-constant';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';

export class PortalAccountModelFactory implements FactoryHelper<PortalAccount> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<PortalAccount> {
    const portalAccount = new PortalAccount();
    portalAccount.accountCode = faker.random.uuid();
    portalAccount.name = faker.name.lastName();
    portalAccount.type = faker.random.arrayElement(Object.values(PortalAccountTypeConstant));
    return Promise.resolve(portalAccount);
  }

}