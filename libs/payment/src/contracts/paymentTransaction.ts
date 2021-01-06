import { InitiateTransactionDto } from '@dlabs/payment/dto/initiate-transaction.dto';
import { VerificationResponseDto } from '@dlabs/payment/dto/verification.response.dto';
import { InitiateTransactionResponse } from '@dlabs/payment/dto/initiate-transaction.response';

export interface PaymentTransaction {
  initiate(transactionParameter: InitiateTransactionDto): Promise<InitiateTransactionResponse>

  verify(transactionRef: string): Promise<VerificationResponseDto>;

}