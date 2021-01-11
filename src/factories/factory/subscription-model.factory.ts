import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { Subscription } from '../../domain/entity/subcription.entity';
import { ServiceTypeConstant } from '../../domain/enums/service-type.constant';
import { ServiceFee } from '../../domain/entity/service.fee.entity';
import * as moment from 'moment';

export class SubscriptionModelFactory implements FactoryHelper<Subscription> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Subscription> {
    let subscription = new Subscription();
    subscription.serviceFee = await modelFactory.create(ServiceFee);
    subscription.description = faker.lorem.sentence();
    subscription.code = faker.random.uuid();
    subscription.serviceType = faker.random.arrayElement(Object.values(ServiceTypeConstant));
    subscription.startDate = moment(faker.date.future(), 'DD/MM/YYYY').startOf('day').toDate();
    subscription.endDate = moment(faker.date.future(), 'DD/MM/YYYY').startOf('day').add(30, 'days').toDate();
    return subscription;
  }

}