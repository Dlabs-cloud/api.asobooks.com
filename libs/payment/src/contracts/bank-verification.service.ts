import { BankVerificationResponse } from '@dlabs/payment/dto/bank-verification.response';

export interface BankVerificationService {
  verifyAccount(accountNumber: string, code: string): Promise<BankVerificationResponse>
}