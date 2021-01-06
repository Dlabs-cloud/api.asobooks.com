import { Inject, Injectable } from '@nestjs/common';
import { Bank } from '../domain/entity/bank.entity';
import { BankVerificationService, FLUTTERWAVEBANKVERIFICATION } from '@dlabs/payment';


@Injectable()
export class BankService {
  constructor(@Inject(FLUTTERWAVEBANKVERIFICATION)
              private readonly bankVerificationService: BankVerificationService) {
  }

  verifyBankAccount(accountNumber: string, bank: Bank) {
    return this.bankVerificationService.verifyAccount(accountNumber, bank.flutterWaveReference)
      .then(response => {
        return Promise.resolve({
          bankName: bank.name,
          accountName: response.accountName,
          accountNumber: response.accountNumber,
        });
      });
  }
}