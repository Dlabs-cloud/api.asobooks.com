import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Bank } from '../../domain/entity/bank.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';

export class BankFactory implements FactoryHelper<Bank> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Bank> {
    let bank = new Bank();
    bank.name = faker.name.jobArea() + ' ' + faker.random.alphaNumeric(10) + ' bank';
    bank.code = faker.finance.iban() + faker.random.uuid();
    bank.flutterWaveReference = faker.finance.iban() + faker.random.uuid();
    return Promise.resolve(bank);
  }

}
