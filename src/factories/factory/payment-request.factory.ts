import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PaymentRequest } from '../../domain/entity/payment-request.entity';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentType } from '../../domain/enums/payment-type.enum';
import { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import { Invoice } from '../../domain/entity/invoice.entity';
import { Association } from '../../domain/entity/association.entity';

export class PaymentRequestFactory implements FactoryHelper<PaymentRequest> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<PaymentRequest> {
    const paymentRequest = new PaymentRequest();
    paymentRequest.reference = Date.now() + faker.random.alphaNumeric() + faker.random.uuid();
    paymentRequest.paymentStatus = faker.random.arrayElement(Object.values(PaymentStatus));
    paymentRequest.paymentType = faker.random.arrayElement(Object.values(PaymentType));
    paymentRequest.paymentProvider = faker.random.arrayElement(Object.values(PaymentProvider));
    paymentRequest.merchantReference = Date.now() + faker.random.alphaNumeric();
    paymentRequest.description = faker.random.words(50);
    paymentRequest.association = await modelFactory.create(Association);
    paymentRequest.amountInMinorUnit = Math.ceil(Number(faker.finance.amount(2_00_00, 5000_00)));
    paymentRequest.invoice = await modelFactory.create(Invoice);
    return paymentRequest;
  }

}