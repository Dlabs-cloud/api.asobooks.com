export interface BankAccountVerification {
  verifyBankAccount(bankAccount: string): Promise<{ name, accountNumber }>;
}

export const BankAccountVerification = Symbol('BankAccountVerification');