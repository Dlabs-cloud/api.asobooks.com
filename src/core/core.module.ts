import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';
import { APP_FILTER } from '@nestjs/core';
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
    BullModule.registerQueue({
      name: CronQueue.SUBSCRIPTION,
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
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
