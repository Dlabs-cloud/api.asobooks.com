import { Httpclient, PaymentConfig } from '@dlabs/payment';

export abstract class PaymentBase {


  constructor(protected readonly options: PaymentConfig, protected readonly httpClient: Httpclient) {
  }


}