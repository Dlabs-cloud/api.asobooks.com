import { BankAccountVerification } from '../service/bank-account-verification';
import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class DummyBankAccountVerificationService implements BankAccountVerification {

  private bankAccounts: { name, accountNumber, bankName, bankCode }[] = [
    {
      name: 'Oluwatobi adenekan',
      accountNumber: '2349281234',
      bankName: 'Diamond Bank',
      bankCode: '163',

    },
    {
      name: 'Tolumide Sopein',
      accountNumber: '0127383723',
      bankName: 'Ecobank Nigeria',
      bankCode: '150',
    },
    {
      name: 'lawal Tunde',
      accountNumber: '1127383723',
      bankName: 'Ecobank Nigeria',
      bankCode: '150',
    },
    {
      name: 'shamsiyah danjuma',
      accountNumber: '1234567845',
      bankName: 'Diamond Bank',
      bankCode: '163',
    },
    {
      name: 'faridah Ibrahim',
      accountNumber: '2974567392',
      bankName: 'Ecobank Nigeria',
      bankCode: '150',
    },
  ];

  verifyBankAccount(bankAccountNumber: string, bankCode: string) {
    console.log(bankAccountNumber, bankCode);
    let bankInfo = this.bankAccounts.find(bankAccount => {

      return bankAccount.accountNumber == bankAccountNumber && bankAccount.bankCode == bankCode;
    });
    console.log(bankInfo);
    if (bankInfo) {
      return Promise.resolve(bankInfo);
    }
    throw new NotFoundException('Bank with account number does not exist');
  }


}