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
import { SubscriptionCodeSequence } from './sequenceGenerators/subscription-code.sequence';
import { BillCodeSequence } from './sequenceGenerators/bill-code.sequence';
import { ConfModule } from '../conf/conf.module';
import { InActiveAccountExceptionFilter } from './exception-filters/in-active-account-exception.filter';
import { WalletSequence } from './sequenceGenerators/wallet.sequence';

const illegalArgumentExceptionFilter = {
  provide: APP_FILTER,
  useClass: IllegalArgumentExceptionFilter,
};

const invalidTokenExceptionFilter = {
  provide: APP_FILTER,
  useClass: InvalidTokenExceptionFilter,
};

const forbiddenExceptionFilter = {
  provide: APP_FILTER,
  useClass: InActiveAccountExceptionFilter,
};

const unAuthorizedExceptionFilter = {
  provide: APP_FILTER,
  useClass: UnAuthorizedExceptionFilter,
};
const notActiveExceptionFilter = {
  provide: APP_FILTER,
  useClass: InActiveAccountExceptionFilter,
};

@Module({
  imports: [
    ConfModule,
  ],
  exports: [
    PortalAccountSequence,
    AssociationCodeSequence,
    BankUploadStartup,
    ServiceFeeCodeSequence,
    MembershipCodeSequence,
    BillCodeSequence,
    SubscriptionCodeSequence,
    WalletSequence,
  ],
  providers: [
    PortalAccountSequence,
    AssociationCodeSequence,
    ServiceFeeCodeSequence,
    BillCodeSequence,
    BankUploadStartup,
    WalletSequence,
    SubscriptionCodeSequence,
    // CronStartup,
    MembershipCodeSequence,
    illegalArgumentExceptionFilter,
    invalidTokenExceptionFilter,
    unAuthorizedExceptionFilter,
    notActiveExceptionFilter,
    forbiddenExceptionFilter,
  ],
})

export class CoreModule {
}

