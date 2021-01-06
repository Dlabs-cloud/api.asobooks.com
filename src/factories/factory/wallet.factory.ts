import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Wallet } from '../../domain/entity/wallet.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Association } from '../../domain/entity/association.entity';
import { BankInfo } from '../../domain/entity/bank-info.entity';

export class WalletFactory implements FactoryHelper<Wallet> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Wallet> {
    const wallet = new Wallet();
    wallet.association = await modelFactory.create(Association);
    wallet.availableBalanceInMinorUnits = Math.ceil(Number(faker.finance.amount(2_00_00, 5000_00)));
    wallet.bank = await modelFactory.create(BankInfo);
    wallet.reference = Date.now() + faker.random.alphaNumeric(10);
    return wallet;
  }

}