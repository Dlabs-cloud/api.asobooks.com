import { Inject, Injectable } from '@nestjs/common';
import { Bank } from '../domain/entity/bank.entity';
import { BankVerificationService, FLUTTERWAVEBANKVERIFICATION } from '@dlabs/payment';
import { AccountDetail } from '../domain/entity/account-detail.entity';
import { Connection } from 'typeorm/connection/Connection';
import { AccountDetailRepository } from '../dao/account-detail.repository';


@Injectable()
export class BankService {
  constructor(private readonly connection: Connection,
              @Inject(FLUTTERWAVEBANKVERIFICATION)
              private readonly bankVerificationService: BankVerificationService) {
  }

  verifyBankAccount(accountNumber: string, bank: Bank) {
    return this.connection.getCustomRepository(AccountDetailRepository)
      .findByAccountNumberAndBank(accountNumber, bank)
      .then(accountDetails => {

        if (accountDetails) {
          return Promise.resolve({
            bankName: bank.name,
            accountName: accountDetails.name,
            accountNumber: accountDetails.number,
          });
        }
        return this.bankVerificationService
          .verifyAccount(accountNumber, bank.flutterWaveReference)
          .then(response => {
            const accountDetail = new AccountDetail();
            accountDetail.bank = bank;
            accountDetail.name = response.accountName;
            accountDetail.number = accountNumber;
            return accountDetail.save().then(_ => {
              return Promise.resolve({
                bankName: bank.name,
                accountName: response.accountName,
                accountNumber: response.accountNumber,
              });
            });
          });
      });

  }
}
