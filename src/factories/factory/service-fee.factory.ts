import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { ServiceFee } from '../../domain/entity/service.fee.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Association } from '../../domain/entity/association.entity';
import { BillingCycleConstant } from '../../domain/enums/billing-cycle.constant';
import { ServiceTypeConstant } from '../../domain/enums/service-type.constant';
import * as moment from 'moment';

export class ServiceFeeFactory implements FactoryHelper<ServiceFee> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<ServiceFee> {
    let serviceFee = new ServiceFee();
    serviceFee.association = await modelFactory.create(Association);
    serviceFee.amountInMinorUnit = faker.random.number(10_000_000_000_000);
    serviceFee.cycle = faker.random.arrayElement(Object.values(BillingCycleConstant));
    serviceFee.type = faker.random.arrayElement(Object.values(ServiceTypeConstant));
    serviceFee.name = faker.random.words(2);
    serviceFee.code = faker.random.uuid() + faker.random.uuid() + faker.random.alphaNumeric(15);
    serviceFee.description = faker.lorem.sentence();
    serviceFee.billingStartDate = moment(faker.date.future(), 'DD/MM/YYYY').startOf('day').toDate();
    serviceFee.nextBillingStartDate = serviceFee.billingStartDate;
    serviceFee.dueDate = moment(faker.date.future(), 'DD/MM/YYYY').startOf('day').toDate();
    return serviceFee;
  }

}