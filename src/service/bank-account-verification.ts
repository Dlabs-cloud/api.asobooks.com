export interface BankAccountVerification {
  verifyBankAccount(bankAccountNumber: string, bankCode: string): Promise<{ name, accountNumber }>;
}

export const BankAccountVerification = Symbol('BankAccountVerification');