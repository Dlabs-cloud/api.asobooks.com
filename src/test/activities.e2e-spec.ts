import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import * as request from 'supertest';
import { ActivityLog } from '../domain/entity/activity-log.entity';
import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';


describe('Activity controller', () => {

  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();
  });


  it('Test that recent activities can be gotten', async () => {
    const url = `/activities?type${ActivityTypeConstant.PAYMENT}`;
    return getAssociationUser().then(assoUser => {
      return factory().upset(ActivityLog).use(activityLog => {
        activityLog.association = assoUser.association;
        activityLog.activityType = ActivityTypeConstant.PAYMENT;
        return activityLog;
      }).createMany(7).then(activityLogs => {
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', assoUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
          .expect(200).then(response => {
            const data = response.body.data;
            expect(data.itemsPerPage).toEqual(20);
            expect(data.offset).toEqual(0);
            expect(data.total).toEqual(7);
            const items = data.items;
            const item = items[0];
            expect(item.date).toBeDefined();
            expect(item.description).toBeDefined();
            expect(item.type).toBeDefined();
          });
      });
    });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

});
