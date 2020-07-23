import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Country } from '../../domain/entity/country.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';

export class CountryModelFactory implements FactoryHelper<Country> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Country> {
    const country = new Country();
    country.code = faker.random.alphaNumeric();
    country.name = faker.address.country();
    return Promise.resolve(country);

  }

}