import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Group } from '../domain/entity/group.entity';
import { Association } from '../domain/entity/association.entity';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';
import * as request from 'supertest';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Membership } from '../domain/entity/membership.entity';
import { GroupMembership } from '../domain/entity/group-membership.entity';


async function mockGroupServiceFee(association: Association) {
  return await factory().upset(Group)
    .use(group => {
      group.association = association;
      return group;
    }).create().then(group => {
      return factory().upset(ServiceFee)
        .use(serviceFee => {
          serviceFee.association = association;
          return serviceFee;
        }).create().then(serviceFee => {
          return factory().upset(GroupServiceFee)
            .use(groupServiceFee => {
              groupServiceFee.group = group;
              groupServiceFee.serviceFee = serviceFee;
              return groupServiceFee;
            }).create();
        });
    });
}

describe('group-service-fee-controller', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
  });


  it('Test that a member can be added to a service fee', async () => {
    let association = await factory().create(Association);
    let adminUser = await getAssociationUser(null, null, association);
    let users = [0, 1, 2, 3].map(number => {
      return getAssociationUser(GenericStatusConstant.ACTIVE, null, association, PortalAccountTypeConstant.MEMBER_ACCOUNT);
    });
    let recipients = (await Promise.all(users))
      .map(user => user.user.membership.portalUser.id);

    let groupServiceFee = await mockGroupServiceFee(association);

    await request(applicationContext.getHttpServer())
      .patch(`/service-fees/${groupServiceFee.serviceFee.code}/members`)
      .send({ recipients })
      .set('Authorization', adminUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', adminUser.association.code)
      .expect(200);

    let countUsersInGroup = await connection
      .getCustomRepository(PortalUserRepository)
      .countByServiceFeeAndStatus(groupServiceFee.serviceFee);

    expect(countUsersInGroup).toEqual(4);

  });

  it('Test that a user can be removed from a service fee', async () => {
    let association = await factory().create(Association);
    let adminUser = await getAssociationUser(null, null, association);

    let groupServiceFee = await mockGroupServiceFee(association);

    let groupMemberships = await factory().upset(PortalAccount).use(portalAccount => {
      portalAccount.association = association;
      portalAccount.type = PortalAccountTypeConstant.MEMBER_ACCOUNT;
      return portalAccount;
    }).create().then(portalAccount => {
      return factory().upset(Membership).use(membership => {
        membership.portalAccount = portalAccount;
        return membership;
      }).createMany(3).then(memberships => {
        let membershipGroups = memberships.map(membership => {
          return factory().upset(GroupMembership)
            .use(membershipGroup => {
              membershipGroup.membership = membership;
              membershipGroup.group = groupServiceFee.group;
              return membershipGroup;
            }).create();
        });
        return Promise.all(membershipGroups);
      });
    });

    let mockedUsersInServiceFee = groupMemberships.map(groupMembership => groupMembership.membership.portalUser.id);
    let queries = mockedUsersInServiceFee.map(id => {
      return `userId=${id}`;
    }).join('&');

    const payload = `/service-fees/${groupServiceFee.serviceFee.code}/members?${queries}`;
    await request(applicationContext.getHttpServer())
      .delete(payload)
      .send({ recipients: mockedUsersInServiceFee })
      .set('Authorization', adminUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', adminUser.association.code)
      .expect(204);

    let countUsersInGroup = await connection
      .getCustomRepository(PortalUserRepository)
      .countByServiceFeeAndStatus(groupServiceFee.serviceFee);

    expect(countUsersInGroup).toEqual(0);
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});