import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { PortalAccount } from '../../domain/entity/portal-account.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';
import { Association } from '../../domain/entity/association.entity';
import { now } from 'moment';

export class PortalAccountModelFactory implements FactoryHelper<PortalAccount> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<PortalAccount> {

    const portalAccount = new PortalAccount();
    portalAccount.code = faker.random.uuid() + faker.random.alphaNumeric(10) + now();
    portalAccount.name = faker.name.lastName();
    portalAccount.type = faker.random.arrayElement(Object.values(PortalAccountTypeConstant));
    portalAccount.association = await modelFactory.create(Association);
    return Promise.resolve(portalAccount);
  }

}