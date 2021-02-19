import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { Permission } from '../../domain/entity/permission.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { now } from 'moment';

export class PermissionFactory implements FactoryHelper<Permission> {
  apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Permission> {
    const permission = new Permission();
    permission.code = faker.random.uuid() + faker.random.alphaNumeric(10) + now();
    permission.name = faker.name.firstName();
    return Promise.resolve(permission);
  }

}