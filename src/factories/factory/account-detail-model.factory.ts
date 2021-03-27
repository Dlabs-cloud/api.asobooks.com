import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { AccountDetail } from '../../domain/entity/account-detail.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Bank } from '../../domain/entity/bank.entity';

export class AccountDetailModelFactory implements FactoryHelper<AccountDetail> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<AccountDetail> {
    const accountDetail = new AccountDetail();
    accountDetail.number = faker.finance.account(10);
    accountDetail.bank = await modelFactory.create(Bank);
    accountDetail.name = faker.finance.accountName();
    accountDetail.bvn = faker.finance.account(11);
    return accountDetail;
  }

}
