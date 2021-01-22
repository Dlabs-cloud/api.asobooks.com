import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Address } from '../../domain/entity/address.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Country } from '../../domain/entity/country.entity';

export class AddressModelFactory implements FactoryHelper<Address> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Address> {
    const address = new Address();
    address.name = faker.address.streetAddress();
    address.country = await modelFactory.create(Country);
    return address;
  }

}