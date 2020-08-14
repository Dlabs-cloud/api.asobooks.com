import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule } from './test-utils';
import { getConnection } from 'typeorm';
import { SettingRepository } from '../dao/setting.repository';

describe('Settings Repository test ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;


  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    await applicationContext.init();
    connection = getConnection();

  });


  it('Test that settings can be persisted with default value', async function() {
    const label = 'front_end_url';
    const value = 'https://www.youtube.com/watch?v=gKbO7hh2Ad8';

    await connection.getCustomRepository(SettingRepository).findByLabel(label, value);


    let setting = await getConnection().getCustomRepository(SettingRepository).findByLabel(label, value);
    expect(setting.value).toEqual(value);
    expect(setting.label).toEqual(label);
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});