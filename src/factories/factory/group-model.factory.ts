import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Group } from '../../domain/entity/group.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { GroupTypeConstant } from '../../domain/enums/group-type.constant';
import { Association } from '../../domain/entity/association.entity';

export class GroupModelFactory implements FactoryHelper<Group> {

  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Group> {
    let group = new Group();
    group.type = faker.random.arrayElement(Object.values(GroupTypeConstant));
    group.name = faker.name.lastName();
    group.association = await modelFactory.create(Association);
    return group;
  }

}