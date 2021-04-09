import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailMailerConfiguration } from './email/email.conf';
import { MailerModule } from '@nestjs-modules/mailer';
import { S3Module } from 'nestjs-s3';
import { AmazonSesConfig } from './file/amazon-ses.config';
import { TypeOrmDatasourceConf } from './data-source/type-orm-datasource.conf';
import { BullModule } from '@nestjs/bull';
import { QueueDataStoreConf } from './data-source/queue-data-store.conf';
import { PaymentConf } from './payment/payment.conf';
import { PaymentModule } from '@dlabs/payment';
import { Log } from './logger/Logger';


@Module({
  imports: [
    BullModule.registerQueueAsync(...QueueDataStoreConf.createBullOptions()),

    ConfigModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        let emailConfiguration = new EmailMailerConfiguration(configService);
        return emailConfiguration.getEmailConfig();
      },
    }),

    S3Module.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const amazonSesConfig = new AmazonSesConfig(configService);
        return amazonSesConfig.getConfig();
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ormConfig = new TypeOrmDatasourceConf(configService);
        return ormConfig.getTypeOrmConfig();
      },
    }),

    CommonModule,

    PaymentModule.forRootAsync({
      imports: [
        ConfModule,
      ],
      useExisting: PaymentConf,
    }),

  ],
  exports: [S3Module, BullModule, MailerModule, PaymentConf, PaymentModule, Log],
  providers: [
    PaymentConf,
    Log,
  ],
})
export class ConfModule {
  static get environment(): string {
    return process.env.ENV ?? '';
  }
}
