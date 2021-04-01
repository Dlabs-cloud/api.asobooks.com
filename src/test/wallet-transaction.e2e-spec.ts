import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { Association } from '../domain/entity/association.entity';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, getAssociationUser, mockPaymentTransactions } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection, MoreThanOrEqual } from 'typeorm';
import { factory } from './factory';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as request from 'supertest';
import * as moment from 'moment';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { Wallet } from '../domain/entity/wallet.entity';
import { WalletTransactionRepository } from '../dao/wallet-transaction.repository';

describe('Wallet Transactions', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let association: Association;
  let assoUser;

  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();
    connection = getConnection();
    association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();

    assoUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
  });


  it('Test that a wallet transaction can be gotten by query', async () => {
    jest.setTimeout(12000);
    await connection.getCustomRepository(WalletTransactionRepository).delete({
      id: MoreThanOrEqual(1),
    });
    const wallet = await factory().upset(Wallet).use(wallet => {
      wallet.association = association;
      return wallet;
    }).create();
    await factory().upset(WalletTransaction).use(walletTransaction => {
      walletTransaction.wallet = wallet;
      walletTransaction.amountInMinorUnit = 45_000_00;
      return walletTransaction;
    }).createMany(6);
    const url = `/wallets/transactions?limit=${5}&offset=${0}&minAmountInMinorUnit=${45_000_00}&maxAmountInMinorUnit=${50_000_00}&dateCreatedBefore=${moment(new Date()).format('DD/MM/YYYY')}&dateCreatedAfter=${moment(new Date()).format('DD/MM/YYYY')}`;
    let response = await request(applicationContext.getHttpServer())
      .get(url)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code);

    const data = response.body.data;
    const payload = data.items[0];


    expect(parseInt(data.itemsPerPage.toString())).toEqual(5);
    expect(parseInt(data.total.toString())).toEqual(6);
    expect(payload.initiatedBy.firstName).toBeDefined();
    expect(payload.initiatedBy.lastName).toBeDefined();
    expect(payload.initiatedBy.identifier).toBeDefined();
    expect(payload.initiatedBy.email).toBeDefined();
    expect(payload.amountInMinorUnit).toBeDefined();
    expect(payload.transactionReference).toBeDefined();
    expect(payload.previousWalletBalanceInMinorUnit).toBeDefined();
    expect(payload.walletBalanceInMinorUnit).toBeDefined();
    expect(payload.paymentType).toBeDefined();
    expect(payload.date).toBeDefined();
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });

});
