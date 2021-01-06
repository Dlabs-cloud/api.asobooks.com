import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface PaymentConfig {
  apiKey: string;
  baseUrl?: string;
  redirectUrl?: string;
}

export interface PaymentConfigOptionsFactory {
  createPaymentConfigOption(): Promise<PaymentConfig> | PaymentConfig;
}

export interface PaymentConfigAsyncOption extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<PaymentConfigOptionsFactory>;
  useClass?: Type<PaymentConfigOptionsFactory>;
  useFactory?: (...args) => Promise<PaymentConfig> | PaymentConfig;
  inject?: any[];
}