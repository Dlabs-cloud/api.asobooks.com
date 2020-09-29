import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { WinstonModule } from 'nest-winston';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as winston from 'winston';
import { LoggerInterceptor } from './security/interceptors/logger.interceptor';
import { AccessConstraintInterceptor } from './security/interceptors/access-constraint.interceptor';
import { RemoteAddressInterceptor } from './security/interceptors/remote-address.interceptor';
import { CommonModule } from '../common/common.module';
import { DaoModule } from '../dao/dao.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestPrincipal } from './security/request-principal.service';
import { EmailMailerConfiguration } from './email/email.conf';
import { MailerModule } from '@nestjs-modules/mailer';
import { ServiceModule } from '../service/service.module';
import { S3Module } from 'nestjs-s3';
import { AmazonSesConfig } from './file/amazon-ses.config';
import { AssociationConstraintInterceptor } from './security/interceptors/association-constraint.interceptor';
import { TypeOrmDatasourceConf } from './data-source/type-orm-datasource-conf';
import { BullModule } from '@nestjs/bull';
import { QueueDataStoreConf } from './data-source/queue-data-store-conf';
import { CronQueue } from '../core/cron.enum';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        let emailConfiguration = new EmailMailerConfiguration(configService);
        return emailConfiguration.getEmailConfig();
      },
    }),
    S3Module.forRootAsync({
      imports: [ConfModule],
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
    DaoModule,
    ServiceModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    })],
  exports: [RequestPrincipal],
  providers: [
    RequestPrincipal,
    {
      provide: APP_INTERCEPTOR,
      useExisting: AccessConstraintInterceptor,
    },
    AccessConstraintInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: RemoteAddressInterceptor,
    },
    RemoteAddressInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: AssociationConstraintInterceptor,
    },
    AssociationConstraintInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: LoggerInterceptor,
    },
    LoggerInterceptor,
  ],
})
export class ConfModule {
  static get environment(): string {
    return process.env.ENV ?? '';
  }
}
