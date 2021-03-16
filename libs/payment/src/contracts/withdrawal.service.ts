import { WithdrawalResponseDto } from '@dlabs/payment/dto/withdrawal.response.dto';
import { WithdrawalDto } from '@dlabs/payment/dto/withdrawal.dto';

export interface WithdrawalService {
  withdraw(withdrawalInfo: WithdrawalDto): Promise<WithdrawalResponseDto>
}
