import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Association } from '../../domain/entity/association.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { File } from '../../domain/entity/file.entity';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { Address } from '../../domain/entity/address.entity';

export class AssociationModelFactory implements FactoryHelper<Association> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Association> {
    const association = new Association();
    association.accountNumber = faker.finance.account();
    association.type = faker.random.arrayElement(Object.values(AssociationTypeConstant));
    association.address = await modelFactory.create(Address);
    association.name = faker.name.lastName() + ' Association';

    return association;

  }


}