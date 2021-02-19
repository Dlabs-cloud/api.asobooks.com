import { FactoryHelper } from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import { RolePermission } from '../../domain/entity/role-permission.entity';
import { ModelFactory } from '../../common/test-starter/orm-faker/contracts/ModelFactory';
import { factory } from '../../test/factory';
import { Association } from '../../domain/entity/association.entity';
import { Permission } from '../../domain/entity/permission.entity';
import { Role } from '../../domain/entity/role.entity';

export class RolePermissionFactory implements FactoryHelper<RolePermission> {
  async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<RolePermission> {
    const rolePermission = new RolePermission();
    rolePermission.association = await factory().create(Association);
    rolePermission.permission = await factory().create(Permission);
    rolePermission.role = await factory().create(Role);
    return rolePermission;
  }

}