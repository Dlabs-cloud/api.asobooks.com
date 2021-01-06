import { PaymentConfig, PaymentConfigOptionsFactory } from '@dlabs/payment';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';


@Injectable()
export class PaymentConf implements PaymentConfigOptionsFactory {
  constructor(private readonly config: ConfigService) {
  }

  createPaymentConfigOption(): Promise<PaymentConfig> | PaymentConfig {
    return {
      apiKey: this.config.get<string>('FLUTTERWAVE_SECRET', 'secretKey'),
      baseUrl: this.config.get<string>('FLUTTER_WAVE_BASE_URL', 'base_url'),
    };
  }

}