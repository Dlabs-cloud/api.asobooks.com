import { TestingModule } from '@nestjs/testing';
import { baseTestingModule } from './test-utils';
import { getConnection } from 'typeorm';
import { factory } from './factory';
import { Bank } from '../domain/entity/bank.entity';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';


describe('Master Record controller ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();
    connection = getConnection();
  });

  it('Get all master-records', async function() {
    await factory().createMany(2, Bank);
    return request(applicationContext.getHttpServer())
      .get(`/master-records/banks`)
      .expect(200);
  });

  it('Get all countries', async () => {
    return request(applicationContext.getHttpServer())
      .get(`/master-records/counties`)
      .expect(200);
  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
