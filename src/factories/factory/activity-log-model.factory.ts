import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { ActivityLogEntity } from '../../domain/entity/activity-log.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { ActivityTypeConstant } from '../../domain/enums/activity-type-constant';
import { Association } from '../../domain/entity/association.entity';
import { PortalUser } from '../../domain/entity/portal-user.entity';

export class ActivityLogModelFactory implements FactoryHelper<ActivityLogEntity> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<ActivityLogEntity> {
    const activityLog = new ActivityLogEntity();
    activityLog.activityType = faker.random.arrayElement(Object.values(ActivityTypeConstant));
    activityLog.association = await modelFactory.create(Association);
    activityLog.createdBy = await modelFactory.create(PortalUser);
    activityLog.description = faker.lorem.sentence();
    return activityLog;
  }

}