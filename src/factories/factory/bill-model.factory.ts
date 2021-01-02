import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Bill } from '../../domain/entity/bill.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Membership } from '../../domain/entity/membership.entity';
import { Subscription } from '../../domain/entity/subcription.entity';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class BillModelFactory implements FactoryHelper<Bill> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Bill> {
    return modelFactory
      .create(Membership)
      .then(member => {
        let currentAmountInMinorUnit = Math.ceil(Number(faker.finance.amount(100, 1_000_000)));
        let bill = new Bill();
        bill.code = faker.random.alphaNumeric(10);
        bill.currentAmountInMinorUnit = currentAmountInMinorUnit;
        bill.description = faker.lorem.sentence(10);
        bill.disCountInPercentage = 0;
        bill.lastDispatchDate = undefined;
        bill.membership = member;
        bill.payableAmountInMinorUnit = currentAmountInMinorUnit;
        bill.paymentStatus = faker.random.arrayElement(Object.values(PaymentStatus));
        bill.totalAmountPaidInMinorUnit = 0;
        bill.vatInPercentage = 0;
        return Promise.resolve(bill);
      })
      .then(bill => {
        return modelFactory.create(Subscription).then(subcription => {
          bill.subscription = subcription;
          return Promise.resolve(bill);
        });
      });

  }

}