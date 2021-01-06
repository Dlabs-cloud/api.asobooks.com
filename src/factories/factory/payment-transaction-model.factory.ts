import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { PaymentTransaction } from '../../domain/entity/payment-transaction.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PaymentRequest } from '../../domain/entity/payment-request.entity';
import { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import { PaymentChannel } from '../../domain/enums/payment-channel.enum';

export class PaymentTransactionModelFactory implements FactoryHelper<PaymentTransaction> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<PaymentTransaction> {
    const paymentTransaction = new PaymentTransaction();
    paymentTransaction.paymentRequest = await modelFactory.create(PaymentRequest);
    paymentTransaction.amountInMinorUnit = Math.ceil(Number(faker.finance.amount(2_00_00, 5000_00)));
    paymentTransaction.paymentChannel = faker.random.arrayElement(Object.values(PaymentChannel));
    paymentTransaction.paidBy = `${faker.name.firstName()} ${faker.name.lastName()}`;
    paymentTransaction.datePaid = faker.date.future();
    return paymentTransaction;
  }

}