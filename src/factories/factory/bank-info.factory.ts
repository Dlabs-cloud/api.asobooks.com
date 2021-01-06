import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { BankInfo } from '../../domain/entity/bank-info.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Association } from '../../domain/entity/association.entity';
import { Bank } from '../../domain/entity/bank.entity';

export class BankInfoFactory implements FactoryHelper<BankInfo> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<BankInfo> {
    const bankInfo = new BankInfo();
    bankInfo.accountNumber = faker.random.alphaNumeric(10);
    bankInfo.association = await modelFactory.create(Association);
    bankInfo.bank = await modelFactory.create(Bank);
    bankInfo.payStackRef = faker.random.alphaNumeric(10);
    return bankInfo;
  }

}