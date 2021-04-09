import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { WorkerModule } from '../worker/worker.module';
import { factory } from './factory';
import { WalletWithdrawalProcessor } from '../worker/processors/wallet-withdrawal.processor';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { WalletWithdrawalEnum } from '../domain/enums/wallet.withdrawal.enum';
import { Wallet } from '../domain/entity/wallet.entity';
import { BankInfo } from '../domain/entity/bank-info.entity';
import { Bank } from '../domain/entity/bank.entity';
import * as faker from 'faker';
import { FLUTTERWAVEWITHDRAWAL, PaymentModule, VerificationResponseDto, WithdrawalService } from '@dlabs/payment';
import { Log } from '../conf/logger/Logger';

describe('Wallet Withdrawal processor', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let walletWithdrawalProcessor: WalletWithdrawalProcessor;
  let withdrawalService: WithdrawalService;


  beforeAll(async () => {

    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    applicationContext.useLogger(new Log());
    await applicationContext.init();

    connection = getConnection();
    walletWithdrawalProcessor = applicationContext
      .select(WorkerModule)
      .get<WalletWithdrawalProcessor>(WalletWithdrawalProcessor, { strict: true });

    withdrawalService = applicationContext
      .select(PaymentModule)
      .get<WithdrawalService>(FLUTTERWAVEWITHDRAWAL, { strict: false });

  });

  it('test that wallet withdrawal can be process', () => {
    const response: VerificationResponseDto = {
      amountInMinorUnit: 5_000_00,
      currency: 'NGN',
      datePaid: new Date(),
      merchantReference: faker.random.uuid() + faker.random.uuid(),
      narration: faker.lorem.sentence(),
      paidBy: faker.random.alphaNumeric(),
      paymentOption: 'account',
      status: 'successful',
      transactionReference: faker.random.uuid() + faker.random.alphaNumeric(10),
    };
    const spyInstance = jest.spyOn(withdrawalService, 'withdraw').mockResolvedValue(response);
    return factory().upset(Bank).use(bank => {
      bank.flutterWaveReference = '044';
      return bank;
    }).create().then(bank => {
      return factory().upset(BankInfo).use(bankInFo => {
        bankInFo.accountNumber = '690000040';
        bankInFo.bank = bank;
        return bankInFo;
      }).create();
    }).then(bankInfo => {
      return factory().upset(Wallet).use(wallet => {
        wallet.availableBalanceInMinorUnits = 1_000_000_00;
        wallet.bank = bankInfo;
        return wallet;
      }).create().then(wallet => {
        return factory().upset(WalletWithdrawal).use(walletWithDrawal => {
          walletWithDrawal.merchantReference = null;
          walletWithDrawal.wallet = wallet;
          walletWithDrawal.bankInfo = wallet.bank;
          walletWithDrawal.withdrawalStatus = WalletWithdrawalEnum.PENDING;
          walletWithDrawal.amountInMinorUnit = response.amountInMinorUnit;
          return walletWithDrawal;
        }).create().then(walletDrawable => {
          return walletWithdrawalProcessor
            .process(walletDrawable.id)
            .then(result => {
              expect(result.withdrawalStatus).toEqual(WalletWithdrawalEnum.WAITING_CONFIRMATION);
              expect(result.merchantReference).toBeDefined();
              spyInstance.mockRestore();
              return Wallet.findOne({
                id: wallet.id,
              }).then(wallet => {
                expect(+wallet.availableBalanceInMinorUnits).toEqual(+1_000_000_00 - +5_000_00);
              });

            });
        });
      });
    });

  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
