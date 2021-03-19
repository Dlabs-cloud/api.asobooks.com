import { WithdrawalDto } from '@dlabs/payment/dto/withdrawal.dto';
import { VerificationResponseDto } from '@dlabs/payment/dto';

export interface WithdrawalService {
  withdraw(withdrawalInfo: WithdrawalDto): Promise<VerificationResponseDto>
}
