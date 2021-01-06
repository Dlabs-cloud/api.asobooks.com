import {
  PaymentConfig,
  PaymentConfigAsyncOption,
  PaymentConfigOptionsFactory,
} from '@dlabs/payment/dto/payment-config.dto';
import { FLUTTERWAVETRANSACTION, HTTP_CLIENT_PROVIDER, PAYMENT_CONFIG } from '@dlabs/payment/constants';
import { Provider } from '@nestjs/common';
import { FlutterWaveTransaction } from './core';
import { Httpclient } from '@dlabs/payment/network';
import { ConfigurationParameter } from '@dlabs/payment/network/configuration';

export function createPaymentProvider(config: PaymentConfig): Provider[] {
  return [
    {
      provide: PAYMENT_CONFIG,
      useValue: config,
    },
  ];
}


export const HttpClientProvider = {
  provide: HTTP_CLIENT_PROVIDER,
  useFactory: (option: PaymentConfig) => {
    const configurationParameter: ConfigurationParameter = { apiKey: option.apiKey, basePath: option.baseUrl };
    return new Httpclient(configurationParameter);
  },
  inject: [
    PAYMENT_CONFIG,
  ],
};
export const FlutterwaveTransactionProvider = {
  provide: FLUTTERWAVETRANSACTION,
  useFactory: (httpClient: Httpclient, options: PaymentConfig) => {
    return new FlutterWaveTransaction(options, httpClient);
  },
  inject: [
    HTTP_CLIENT_PROVIDER,
    PAYMENT_CONFIG,
  ],
};

export function createPaymentConfigAsyncProviders(options: PaymentConfigAsyncOption) {
  if (options.useExisting || options.useFactory) {
    return [createPaymentConfigAsyncOptionsProviders(options)];
  }
  return [
    createPaymentConfigAsyncOptionsProviders(options),
    {
      provide: options.useClass,
      useClass: options.useClass,
    },
  ];
}

function createPaymentConfigAsyncOptionsProviders(options: PaymentConfigAsyncOption) {
  if (options.useFactory) {
    return {
      provide: PAYMENT_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  return {
    provide: PAYMENT_CONFIG,
    useFactory: async (optionsFactory: PaymentConfigOptionsFactory) => optionsFactory.createPaymentConfigOption(),
    inject: [options.useExisting || options.useClass],

  };

}