import { BankVerificationService } from '@dlabs/payment';
import { PaymentBase } from '@dlabs/payment/core/payment-base';
import { FlutterWaveBankVerificationRequestDto } from '@dlabs/payment/dto/flutter-wave/flutter-wave-bank-verification.request.dto';
import { BankVerificationResponse } from '@dlabs/payment/dto/bank-verification.response';
import { FlutterWaveBankVerificationResponseDto } from '@dlabs/payment/dto/flutter-wave/flutter-wave-bank-verification.response.dto';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';

export class FlutterWaveBankVerification extends PaymentBase implements BankVerificationService {

  verifyAccount(accountNumber: string, code: string): Promise<BankVerificationResponse> {
    const request: FlutterWaveBankVerificationRequestDto = {
      account_bank: code,
      account_number: accountNumber,
    };
    try {
      return this.httpClient
        .request()
        .post<FlutterWaveBankVerificationResponseDto>('/accounts/resolve', request)
        .then(response => {
          const data: BankVerificationResponse = {
            accountName: response.data.account_name,
            accountNumber: response.data.account_number,
          };
          return Promise.resolve(data);
        }).catch(e => {
          if (e.status === 400) {
            throw new NotFoundException(`Bank account ${accountNumber} cannot be found`);
          }
          return Promise.reject(e);
        });
    } catch (error) {
      throw new ServiceUnavailableException('Payment service is not available at this time');
    }

  }

}