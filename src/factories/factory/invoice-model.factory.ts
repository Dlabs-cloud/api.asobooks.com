import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Invoice } from '../../domain/entity/invoice.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { ServiceTypeConstant } from '../../domain/enums/service-type.constant';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { Membership } from '../../domain/entity/membership.entity';

export class InvoiceModelFactory implements FactoryHelper<Invoice> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Invoice> {
    const invoice = new Invoice();
    invoice.paymentStatus = faker.random.arrayElement(Object.values(PaymentStatus));
    invoice.createdBy = await modelFactory.create(Membership);
    invoice.code = Date.now() + faker.random.alphaNumeric() + faker.random.uuid();
    invoice.payableAmountInMinorUnit = Math.ceil(Number(faker.finance.amount(2_00_00, 5000_00)));
    invoice.surchargeInMinorUnit = 2_00_00;
    invoice.amountPaidInMinorUnit = 0;
    invoice.amountInMinorUnit = invoice.payableAmountInMinorUnit - invoice.surchargeInMinorUnit;
    return invoice;
  }

}