import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { WalletTransaction } from '../../domain/entity/wallet-transaction.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Wallet } from '../../domain/entity/wallet.entity';
import { PaymentTransaction } from '../../domain/entity/payment-transaction.entity';
import { PaymentType } from '../../domain/enums/payment-type.enum';
import { factory } from '../../test/factory';
import { WalletWithdrawal } from '../../domain/entity/wallet-withdrawal.entity';
import { Membership } from '../../domain/entity/membership.entity';

export class WalletTransactionFactory implements FactoryHelper<WalletTransaction> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<WalletTransaction> {
    const transaction = new WalletTransaction();
    const wallet = await modelFactory.create(Wallet);
    transaction.wallet = wallet;
    transaction.walletBalanceInMinorUnit = wallet.availableBalanceInMinorUnits;
    transaction.amountInMinorUnit = faker.random.number({
      min: 5_00_00,
      max: 10_000_00,
    });
    transaction.paymentTransaction = await modelFactory.create(PaymentTransaction);
    transaction.initiatedBy = await modelFactory.create(Membership);
    transaction.paymentType = faker.random.arrayElement(Object.values(PaymentType));
    transaction.previousWalletBalanceInMinorUnit = wallet.availableBalanceInMinorUnits;
    return Promise.resolve(transaction);
  }

}
