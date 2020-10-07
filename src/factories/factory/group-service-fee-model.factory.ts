import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { GroupServiceFee } from '../../domain/entity/group-sevice-fee.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { ServiceFee } from '../../domain/entity/service.fee.entity';
import { Group } from '../../domain/entity/group.entity';

export class GroupServiceFeeModelFactory implements FactoryHelper<GroupServiceFee> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<GroupServiceFee> {
    let groupServiceFee = new GroupServiceFee();
    groupServiceFee.serviceFee = await modelFactory.create(ServiceFee);
    groupServiceFee.group = await modelFactory.create(Group);
    return groupServiceFee;
  }

}