import { DynamicModule, Global, Module } from '@nestjs/common';
import { PaymentConfig, PaymentConfigAsyncOption } from '@dlabs/payment/dto';
import {
  createPaymentConfigAsyncProviders,
  createPaymentProvider,
  FlutterwaveTransactionProvider,
  HttpClientProvider,
} from './payment.provider';

@Global()
@Module({
  providers: [],
  exports: [],
})
export class PaymentModule {

  static forRoot(config: PaymentConfig) {
    console.log(config);
    const providers = [
      ...createPaymentProvider(config),
      HttpClientProvider,
      FlutterwaveTransactionProvider,
    ];
    return {
      module: PaymentModule,
      providers,
      exports: [
        FlutterwaveTransactionProvider,
      ],
    };
  }


  static forRootAsync(asyncConfig: PaymentConfigAsyncOption): DynamicModule {
    const providers = [...createPaymentConfigAsyncProviders(asyncConfig),
      HttpClientProvider,
      FlutterwaveTransactionProvider];

    return {
      module: PaymentModule,
      providers,
      imports: asyncConfig.imports,
      exports: [
        FlutterwaveTransactionProvider,
      ],
    };
  }
}
