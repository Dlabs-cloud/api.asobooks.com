import { PaymentTransactionService } from '@dlabs/payment/contracts';
import {
  FlutterWaveInitiateTransactionDto,
  InitiateTransactionDto,
  VerificationResponseDto,
} from '@dlabs/payment/dto';
import { FlutterWaveInitiateTransactionResponseDto } from '@dlabs/payment/dto/flutter-wave/flutter-wave-initiate-transaction.response.dto';
import { InitiateTransactionResponse } from '@dlabs/payment/dto/initiate-transaction.response';
import { PaymentBase } from '@dlabs/payment/core/payment-base';
import { AxiosResponseException } from '@dlabs/payment/exception';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { FlutterWaveResponse } from '@dlabs/payment/dto/flutter-wave/flutter-wave-verify-transaction.response.dto';


export class FlutterWaveTransaction extends PaymentBase implements PaymentTransactionService {

  initiate(transactionParameter: InitiateTransactionDto): Promise<InitiateTransactionResponse> {
    transactionParameter.redirectUrl = this.options.redirectUrl || transactionParameter.redirectUrl;
    if (!transactionParameter.redirectUrl) {
      throw new Error('Payment redirect Url must be provided');
    }
    const data: FlutterWaveInitiateTransactionDto = {
      amount: transactionParameter.amountInMinorUnit / 100,
      currency: 'NGN',
      customer: {
        email: transactionParameter.customer.email,
        name: transactionParameter.customer.name,
        phonenumber: transactionParameter.customer.phonenumber,
      },
      payment_options: transactionParameter.paymentOption,
      tx_ref: transactionParameter.transactionRef,
      redirect_url: transactionParameter.redirectUrl,
    } as FlutterWaveInitiateTransactionDto;

    try {
      return this.httpClient.request()
        .post<any, FlutterWaveInitiateTransactionResponseDto>('/payments', data)
        .then(response => {
          const res: InitiateTransactionResponse = {
            merchantReference: undefined,
            paymentLink: response.data.link,
          };
          return Promise.resolve(res);
        });
    } catch (e) {
      return Promise.reject(e);
    }

  }


  verify(transactionRef: string): Promise<VerificationResponseDto> {
    try {
      return this.httpClient.request().get<any, FlutterWaveResponse>(`/transactions/${transactionRef}/verify`)
        .then(response => {
          const res: VerificationResponseDto = {
            datePaid: new Date(response.data.created_at),
            paidBy: response.data.customer.name,
            currency: 'NGN',
            narration: response.data.narration,
            amountInMinorUnit: response.data.amount * 100,
            merchantReference: response.data.id.toString(),
            paymentOption: response.data.payment_type as any,
            status: response.data.status as any,
            transactionReference: response.data.tx_ref,
          };
          return Promise.resolve(res);
        }).catch(e => {
          if (e instanceof AxiosResponseException) {
            if (e.status === 400) {
              throw new NotFoundException(`Payment with reference ${transactionRef} cannot be found`);
            }
          }
          return Promise.reject(e);
        });
    } catch (e) {
      throw new ServiceUnavailableException('Payment service is not available at this time');
    }

  }

}