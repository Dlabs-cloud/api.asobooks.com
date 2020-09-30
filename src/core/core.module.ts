import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { IllegalArgumentExceptionFilter } from './exception-filters/illegal-argument-exception-filter';
import { InvalidTokenExceptionFilter } from './exception-filters/invalid-token-exception.filter';
import { AssociationCodeSequence } from './sequenceGenerators/association-code.sequence';
import { ServiceFeeCodeSequence } from './sequenceGenerators/service-fee-code.sequence';
import { MembershipCodeSequence } from './sequenceGenerators/membership-code.sequence';
import { UnAuthorizedExceptionFilter } from './exception-filters/un-authorized-exception.filter';
import { CronStartup } from './start-ups/cron.startup';
import { ConfModule } from '../conf/conf.module';
import { BullModule } from '@nestjs/bull';
import { CronQueue } from './cron.enum';
import { SubscriptionCodeSequence } from './sequenceGenerators/subscription-code.sequence';
import { QueueDataStoreConf } from '../conf/data-source/queue-data-store-conf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { AccessConstraintInterceptor } from '../dlabs-nest-starter/security/interceptors/access-constraint.interceptor';
import { RemoteAddressInterceptor } from '../dlabs-nest-starter/security/interceptors/remote-address.interceptor';
import { AssociationConstraintInterceptor } from '../dlabs-nest-starter/security/interceptors/association-constraint.interceptor';
import { LoggerInterceptor } from '../dlabs-nest-starter/security/interceptors/logger.interceptor';

const illegalArgumentExceptionFilter = {
  provide: APP_FILTER,
  useClass: IllegalArgumentExceptionFilter,
};

const invalidTokenExceptionFilter = {
  provide: APP_FILTER,
  useClass: InvalidTokenExceptionFilter,
};

const unAuthorizedExceptionFilter = {
  provide: APP_FILTER,
  useClass: UnAuthorizedExceptionFilter,
};

@Module({
  imports: [
    BullModule.registerQueueAsync(...QueueDataStoreConf.createBullOptions()),
  ],
  exports: [
    PortalAccountSequence,
    AssociationCodeSequence,
    BankUploadStartup,
    ServiceFeeCodeSequence,
    MembershipCodeSequence,
    SubscriptionCodeSequence,
  ],
  providers: [
    PortalAccountSequence,
    AssociationCodeSequence,
    ServiceFeeCodeSequence,
    BankUploadStartup,
    SubscriptionCodeSequence,
    CronStartup,
    MembershipCodeSequence,
    illegalArgumentExceptionFilter,
    invalidTokenExceptionFilter,
    unAuthorizedExceptionFilter,
  ],
})

export class CoreModule {
}

