import { PaymentBase } from '@dlabs/payment/core/payment-base';
import { WithdrawalDto, WithdrawalResponseDto, WithdrawalService } from '@dlabs/payment';
import { FlutterWaveWithdrawalDto } from '@dlabs/payment/dto/flutter-wave/flutter-wave-withdrawal.dto';
import { FlutterWaveWithdrawalResponseDto } from '@dlabs/payment/dto/flutter-wave/flutter-wave-withdrawal.response.dto';

export class FlutterWaveWithdrawal extends PaymentBase implements WithdrawalService {
  withdraw(withdrawalInfo: WithdrawalDto): Promise<WithdrawalResponseDto> {
    const payload: FlutterWaveWithdrawalDto = {
      account_bank: withdrawalInfo.bank,
      account_number: withdrawalInfo.accountNumber,
      amount: withdrawalInfo.amountInMinorUnit * 100,
      beneficiary_name: withdrawalInfo.receiversName,
      narration: withdrawalInfo.description,
      reference: withdrawalInfo.reference,
    };

    try {
      return this.httpClient.request()
        .post<any, FlutterWaveWithdrawalResponseDto>('/transfers', payload)
        .then(response => {
          const res: WithdrawalResponseDto = {
            reference: response.data.id,
          };
          return Promise.resolve(res);
        });
    } catch (e) {
      return Promise.reject(e);
    }
  }

}
