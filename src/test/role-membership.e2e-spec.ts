import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection, MoreThanOrEqual } from 'typeorm';
import { factory } from './factory';
import { RolePermission } from '../domain/entity/role-permission.entity';
import * as request from 'supertest';
import { Role } from '../domain/entity/role.entity';
import { MembershipRole } from '../domain/entity/membership-role.entity';
import { json } from 'express';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';

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


  it('Get memberships and thier roles', () => {
    return getAssociationUser()
      .then(testUser => {
        return factory().upset(Role).use(role => {
          role.association = testUser.association;
          return role;
        }).create()
          .then(role => {
            return factory().upset(RolePermission).use(rolePermission => {
              rolePermission.role = role;
              return rolePermission;
            }).create().then(_ => {
              return factory().upset(MembershipRole).use(membershipRole => {
                membershipRole.membership = testUser.user.membership;
                membershipRole.role = role;
                return membershipRole;
              }).createMany(4).then(_ => {
                return request(applicationContext.getHttpServer())
                  .get(`/role-memberships?accountType=${PortalAccountTypeConstant.EXECUTIVE_ACCOUNT}`)
                  .set('Authorization', testUser.token)
                  .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
                  .expect(200).then(response => {

                    const data = response.body.data;
                    const datum = data[0];
                    expect(datum.email).toBeDefined();
                    expect(datum.firstName).toBeDefined();
                    expect(datum.identifier).toBeDefined();
                    expect(datum.lastName).toBeDefined();
                    expect(datum.roles).toEqual(expect.arrayContaining([
                      expect.objectContaining({
                        name: expect.anything(),
                        code: expect.anything(),
                      }),
                    ]));
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
