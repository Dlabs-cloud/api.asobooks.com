import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import * as request from 'supertest';

describe('Bank Account verification', () => {
    let applicationContext: INestApplication;
    let connection: Connection;
    let associationUser;


    beforeAll(async () => {

      const moduleRef: TestingModule = await baseTestingModule().compile();
      applicationContext = moduleRef.createNestApplication();
      applicationContext.useGlobalPipes(new ValidatorTransformPipe());
      await applicationContext.init();

      associationUser = await getAssociationUser();
      connection = getConnection();
    });


    it('Test that an account can be verified with account number', async () => {

      const url = `/payments/bank/${150}/account/${2974567392}/verify`;
      let response = await request(applicationContext.getHttpServer())
        .get(url)
        .set('Authorization', associationUser.token);

      expect(response.status).toEqual(200);
      expect('2974567392').toEqual(response.body.data.accountNumber);
      expect('faridah Ibrahim').toEqual(response.body.data.name);
    });


    it('Test that an account number that does not exist will return a 404', async () => {
      const url = `/payments/bank/${150}/account/${297457392}/verify`;
      let response = await request(applicationContext.getHttpServer())
        .get(url)
        .set('Authorization', associationUser.token);

      expect(response.status).toEqual(404);
    });


    afterAll(async () => {
      await connection.close();
      await applicationContext.close();
    });
  },
);