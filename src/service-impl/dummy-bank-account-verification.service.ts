import { BankAccountVerification } from '../service/bank-account-verification';
import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class DummyBankAccountVerificationService implements BankAccountVerification {
  private bankAccounts: { name, accountNumber }[] = [
    {
      name: 'Oluwatobi adenekan',
      accountNumber: '2349281234',
    },
    {
      name: 'Tolumide Sopein',
      accountNumber: '0127383723',
    },
    {
      name: 'lawal Tunde',
      accountNumber: '1127383723',
    },
    {
      name: 'shamsiyah danjuma',
      accountNumber: '1234567845',
    },
    {
      name: 'faridah Ibrahim',
      accountNumber: '2974567392',
    },
  ];

  verifyBankAccount(bankAccountNumber: string) {
    let bankInfo = this.bankAccounts.find(bankAccount => {
      return bankAccount.accountNumber == bankAccountNumber;
    });
    console.log(bankInfo);
    if (bankInfo) {
      return Promise.resolve(bankInfo);
    }
    throw new NotFoundException('Bank with account number does not exist');
  }


}