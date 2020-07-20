import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '../../app.module';
import {TestUtils} from './test-utils';
import * as request from 'supertest';
import * as faker from 'faker';

import {factory} from './factory';

describe('Wallet holder controller', () => {

    let applicationContext: INestApplication;
    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        applicationContext = moduleRef.createNestApplication();
        await applicationContext.init();
        await TestUtils.init();
    });

    it('Test that a w wallet holder can be created with a wallet', async () => {
        // const bank = await factory().create<BankEntity>(BankEntity);
        const wallerHolderData = {
            bank_account_number: faker.finance.account(),
            email: faker.internet.email(),
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
        };

        const response = await request(applicationContext.getHttpServer())
            .post('/')
            .send(wallerHolderData)
            .expect(201);

        // const wallet = await getConnection().getCustomRepository(WalletRepository).findOneItem({
        //     wallerNumber: response.body.wallet_number,
        // });
        //
        // expect(response.body.available_balance_in_kobo).toEqual(0);
        // expect(response.body.book_balance_in_kobo).toEqual(0);
        // expect(response.body.wallet_number).toEqual(wallet.wallerNumber);

    });

});