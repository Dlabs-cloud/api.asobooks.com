import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
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

@Module({
  imports: [
    BullModule.registerQueueAsync(...QueueDataStoreConf.createBullOptions()),
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
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    })],
  exports: [S3Module, BullModule, MailerModule],
  providers: [],
})
export class ConfModule {
  static get environment(): string {
    return process.env.ENV ?? '';
  }
}
