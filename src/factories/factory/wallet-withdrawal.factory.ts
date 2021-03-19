import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { WalletWithdrawal } from '../../domain/entity/wallet-withdrawal.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PaymentType } from '../../domain/enums/payment-type.enum';
import { WalletWithdrawalEnum } from '../../domain/enums/wallet.withdrawal.enum';
import { BankInfo } from '../../domain/entity/bank-info.entity';
import { WalletRepository } from '../../dao/wallet.repository';
import { Wallet } from '../../domain/entity/wallet.entity';
import { Membership } from '../../domain/entity/membership.entity';

export class WalletWithdrawalFactory implements FactoryHelper<WalletWithdrawal> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<WalletWithdrawal> {
    const walletWithdrawal = new WalletWithdrawal();
    walletWithdrawal.amountInMinorUnit = faker.random.number({
      min: 5_00_00,
      max: 10_000_00,
    });
    walletWithdrawal.withdrawalStatus = faker.random.arrayElement(Object.values(WalletWithdrawalEnum));
    walletWithdrawal.merchantReference = faker.random.uuid() + new Date().getDate();
    walletWithdrawal.bankInfo = await modelFactory.create(BankInfo);
    walletWithdrawal.reference = faker.random.uuid() + new Date().getDate();
    walletWithdrawal.description = faker.lorem.sentence();
    walletWithdrawal.wallet = await modelFactory.create(Wallet);
    walletWithdrawal.initiatedBy = await modelFactory.create(Membership);
    return Promise.resolve(walletWithdrawal);
  }

}
