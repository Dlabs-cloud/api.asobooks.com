import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../../app.module';
import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {getConnection} from 'typeorm';
import {TestUtils} from './test-utils';
import {factory} from './factory';
import {Setting} from '../../domain/entity/setting.entity';
import {SettingModelFactory} from '../../factories/factory/setting-model-factory';

async function test200Response(applicationContext: INestApplication, endpoint: string) {
    return request(applicationContext.getHttpServer())
        .get(endpoint).expect(200);
}

describe('Test that trusted ip endpoints', () => {
    let applicationContext: INestApplication;
    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        applicationContext = moduleRef.createNestApplication();
        await applicationContext.init();
    });

    it('Test that end points with @public annotation returns 200', async () => {
        const public_ip = [
            '/test',
        ];
        const tests = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < public_ip.length; i++) {
            tests.push(test200Response(applicationContext, public_ip[i]));
        }
        return Promise.all(tests);
    });

    afterAll(async () => {
        await getConnection().close();
        await applicationContext.close();
    });
});