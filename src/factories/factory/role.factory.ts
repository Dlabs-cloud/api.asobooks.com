import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Role } from '../../domain/entity/role.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { now } from 'moment';
import { factory } from '../../test/factory';
import { Association } from '../../domain/entity/association.entity';

export class RoleFactory implements FactoryHelper<Role> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Role> {
    const role = new Role();
    role.code = faker.random.uuid() + faker.random.alphaNumeric(10) + now();
    role.association = await factory().create(Association);
    role.name = faker.name.firstName();
    return role;
  }

}