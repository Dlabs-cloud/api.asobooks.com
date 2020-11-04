import {INestApplication} from "@nestjs/common";
import {Connection} from "typeorm/connection/Connection";
import {TestingModule} from "@nestjs/testing";
import {baseTestingModule, getAssociationUser} from "./test-utils";
import {ValidatorTransformPipe} from "../conf/validator-transform.pipe";
import {getConnection} from "typeorm/index";
import {factory} from "./factory";
import {Association} from "../domain/entity/association.entity";
import * as request from "supertest";

describe('dashboard-controller', () => {
    let applicationContext: INestApplication;
    let connection: Connection;
    beforeAll(async () => {
        const moduleRef: TestingModule = await baseTestingModule().compile();
        applicationContext = moduleRef.createNestApplication();
        applicationContext.useGlobalPipes(new ValidatorTransformPipe());
        await applicationContext.init();

        connection = getConnection();
    });

    it('Test that an admin member can view dashboard metrics', async () => {
        let association = await factory().create(Association);
        let adminUser = await getAssociationUser(null, null, association);


        let response = await request(applicationContext.getHttpServer())
            .get(`/dashboard/dashboard`)
            .set('Authorization', adminUser.token)
            .set('X-ASSOCIATION-IDENTIFIER', adminUser.association.code);
        expect(response.status).toEqual(200);
        expect(response.body.data.metrics).toBeDefined();
        expect(response.body.data.recentTransactions).toBeDefined();

    });

    it('Test that an admin member can view contributions', async () => {
        let association = await factory().create(Association);
        let adminUser = await getAssociationUser(null, null, association);
        let year = 2020

        let response = await request(applicationContext.getHttpServer())
            .get(`/dashboard/contributions?year=${year}`)
            .set('Authorization', adminUser.token)
            .set('X-ASSOCIATION-IDENTIFIER', adminUser.association.code);
        expect(response.status).toEqual(200);
        expect(response.body.data).toBeDefined();

    });
    it('Test that an admin member can view recent-activities', async () => {
        let association = await factory().create(Association);
        let adminUser = await getAssociationUser(null, null, association);


        let response = await request(applicationContext.getHttpServer())
            .get(`/dashboard/recent-activities`)
            .set('Authorization', adminUser.token)
            .set('X-ASSOCIATION-IDENTIFIER', adminUser.association.code);
        expect(response.status).toEqual(200);
    });

    afterAll(async () => {
        await connection.close();
        await applicationContext.close();
    });
});