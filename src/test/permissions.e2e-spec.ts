import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getLoginUser, getTestUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Permission } from '../domain/entity/permission.entity';
import * as request from 'supertest';

describe('permission controller', () => {
  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
  });


  it('Test can get all permissions', () => {
    return factory().createMany(10, Permission).then(_ => {
      return getLoginUser().then(testUser => {
        return request(applicationContext.getHttpServer())
          .get(`/permissions`)
          .set('Authorization', testUser.token)
          .expect(200).then(response => {
            const data = response.body.data;
            expect(data).toEqual(expect.arrayContaining([
              expect.objectContaining({
                name: expect.anything(),
                code: expect.anything(),
              }),
            ]));
          });
      });
    });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});

