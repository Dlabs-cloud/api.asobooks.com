import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Membership } from '../domain/entity/membership.entity';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { RoleMembershipRequestDto } from '../dto/role-membership.request.dto';
import * as request from 'supertest';
import { Role } from '../domain/entity/role.entity';
import { MembershipRoleRepository } from '../dao/membership-role.repository';
import { MembershipRole } from '../domain/entity/membership-role.entity';

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

  it('test that a list of memberships can be added to role', () => {
    return getAssociationUser().then(associationUser => {
      return connection.getCustomRepository(PortalAccountRepository)
        .findByAssociationAndStatusAndTypes(associationUser.association, GenericStatusConstant.ACTIVE, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
        .then(portalAccount => {
          return factory().upset(Membership).use(membership => {
            membership.portalAccount = portalAccount[0];
            return membership;
          }).createMany(2);
        }).then(memberships => {
          const payload: RoleMembershipRequestDto = {
            membershipReferences: memberships.map(membership => membership.membershipInfo.identifier),
          };
          return factory().upset(Role).use(role => {
            role.association = associationUser.association;
            return role;
          }).create().then(role => {
            return request(applicationContext.getHttpServer())
              .post(`/roles/${role.code}/memberships`)
              .set('Authorization', associationUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', associationUser.association.code)
              .send(payload)
              .expect(204).then(_ => {
                return connection.getCustomRepository(MembershipRoleRepository).count({
                  role,
                }).then(count => {
                  expect(count).toEqual(2);
                });
              });
          });
        });
    });
  });

  it('Test that membership can be removed from a role', () => {
    return getAssociationUser().then(_ => {
      return factory().upset(Role).use(role => {
        role.association = _.association;
        return role;
      }).create().then(role => {
        return connection.getCustomRepository(PortalAccountRepository)
          .findByAssociationAndStatusAndTypes(_.association, GenericStatusConstant.ACTIVE, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
          .then(portalAccount => {
            return factory().upset(Membership).use(membership => {
              membership.portalAccount = portalAccount[0];
              return membership;
            }).create().then(membership => {
              return factory().upset(MembershipRole).use(membershipRole => {
                membershipRole.role = role;
                membershipRole.membership = membership;
                return membershipRole;
              }).create().then(() => {
                return request(applicationContext.getHttpServer())
                  .delete(`/roles/${role.code}/memberships/${membership.membershipInfo.identifier}`)
                  .set('Authorization', _.token)
                  .set('X-ASSOCIATION-IDENTIFIER', _.association.code)
                  .expect(204).then(_ => {
                    return connection.getCustomRepository(MembershipRoleRepository).count({
                      membership, status: GenericStatusConstant.DELETED,
                    }).then(count => {
                      expect(count).toEqual(1);
                    });
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