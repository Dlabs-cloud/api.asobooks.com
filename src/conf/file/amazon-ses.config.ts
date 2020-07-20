import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3ModuleOptions } from 'nestjs-s3';

@Injectable()
export class AmazonSesConfig {

  constructor(private readonly configService: ConfigService) {
  }

  getConfig(): S3ModuleOptions {
    return {
      config: {
        accessKeyId: this.configService.get<string>('AMAZON_S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>('AMAZON_S3_SECRET_KEY', ''),
        signatureVersion: 'v4',
        region: this.configService.get<string>('AMAZON_REGION','eu-west-2')
      },
    };
  }
}