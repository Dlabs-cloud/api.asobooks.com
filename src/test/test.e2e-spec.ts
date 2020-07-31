import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';

describe('Test controller ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();

  });

  it('test that a method with @AssociationContext context gets associaton ', async () => {

    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();
    let associationUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
    let response = await request(applicationContext.getHttpServer())
      .get('/test/association')
      .set('Authorization', associationUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', associationUser.associationCode);
    expect(response.body.name).toEqual(association.name);
    expect(response.body.type).toEqual(association.type);
    expect(response.status).toEqual(200);
  });

  it('test that a method with @AssociationContext without header will fail', async () => {
    let association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();
    let associationUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
    let response = await request(applicationContext.getHttpServer())
      .get('/test/association')
      .set('Authorization', associationUser.token);
    expect(response.status).toEqual(401);
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});