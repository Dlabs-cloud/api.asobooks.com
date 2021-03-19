import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection, MoreThanOrEqual } from 'typeorm';
import { factory } from './factory';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { RoleRequest } from '../dto/role.request';
import { Permission } from '../domain/entity/permission.entity';
import * as faker from 'faker';
import * as request from 'supertest';
import { RolePermissionRepository } from '../dao/role-permission.repository';
import { RoleRepository } from '../dao/role.repository';
import { Role } from '../domain/entity/role.entity';
import { RolePermission } from '../domain/entity/role-permission.entity';
import { PermissionRepository } from '../dao/permission.repository';

describe('role controller-e2e', () => {
  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
  });


  it('Test that a role can be created', async () => {
    const payload: RoleRequest = await factory().createMany(4, Permission).then(permissions => {
      const payload: RoleRequest = { name: faker.name.firstName(), permissions: [] };
      payload.permissions = permissions.map(permission => permission.code);
      return payload;
    });
    return getAssociationUser().then(testUser => {

      return request(applicationContext.getHttpServer())
        .post('/roles')
        .set('Authorization', testUser.token)
        .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
        .send(payload)
        .expect(201)
        .then(response => {
          const data = response.body.data;
          return connection
            .getCustomRepository(RoleRepository)
            .findOne({ code: data.code }).then(role => {
              return connection.getCustomRepository(RolePermissionRepository)
                .count({ role: role }).then(count => {
                  expect(count).toEqual(4);
                });
            });
        });

    });

  });


  it('Test that a role can be gotten with its permissions', () => {
    return connection
      .getCustomRepository(RolePermissionRepository)
      .delete({
        id: MoreThanOrEqual(1),
      }).then(_ => {
        return connection.getCustomRepository(PermissionRepository).delete({
          id: MoreThanOrEqual(1),
        }).then(U => {
          return getAssociationUser().then(testUser => {
            return factory().upset(Role).use(role => {
              role.association = testUser.association;
              return role;
            }).create().then(role => {
              return factory().upset(RolePermission).use(rolePermission => {
                rolePermission.role = role;
                rolePermission.association = testUser.association;
                return rolePermission;
              }).create().then(rolePermission => {
                return request(applicationContext.getHttpServer())
                  .get(`/roles/${role.code}`)
                  .set('Authorization', testUser.token)
                  .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
                  .expect(200).then(response => {
                    const data = response.body.data;
                    expect(data).toEqual({
                      name: role.name,
                      code: role.code,
                      permissions: [
                        {
                          name: rolePermission.permission.name,
                          code: rolePermission.permission.code,
                          exist: true,
                        },
                      ],
                    });
                  });
              });
            });
          });
        });
      });


  });


  it('Test that a role can be deleted', () => {
    return getAssociationUser().then(testUser => {
      return factory().upset(Role).use(role => {
        role.association = testUser.association;
        return role;
      }).create().then(role => {
        return factory().upset(RolePermission).use(rolePermission => {
          rolePermission.role = role;
          return rolePermission;
        }).createMany(2).then(_ => {
          return request(applicationContext.getHttpServer())
            .delete(`/roles/${role.code}`)
            .set('Authorization', testUser.token)
            .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
            .expect(204).then(_ => {
              return getConnection().getCustomRepository(RoleRepository).count({
                code: role.code,
                status: GenericStatusConstant.IN_ACTIVE,
              })
                .then(count => {
                  expect(count).toEqual(1);
                }).then(_ => {
                  return connection
                    .getCustomRepository(RolePermissionRepository)
                    .count({ role, status: GenericStatusConstant.IN_ACTIVE })
                    .then(count => {
                      expect(count).toEqual(2);
                    });
                });
            });
        });
      });
    });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
