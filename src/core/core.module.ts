import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';
import { APP_FILTER } from '@nestjs/core';
import { IllegalArgumentExceptionFilter } from './exception-filters/illegal-argument-exception.filter';
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
import { InvoiceCodeSequence } from './sequenceGenerators/invoice-code.sequence';
import { PaymentRequestReferenceSequence } from './sequenceGenerators/payment-request-reference.sequence';
import { ServiceUnavailableExceptionFilter } from './exception-filters/service-unavailable-exception.filter';
import { NotFoundExceptionFilter } from './exception-filters/not-found-exception.filter';
import { PaymentTransactionSequence } from './sequenceGenerators/payment-transaction.sequence';
import { CommonModule } from '../common/common.module';

const illegalArgumentExceptionFilter = {
  provide: APP_FILTER,
  useClass: IllegalArgumentExceptionFilter,
};

const notFoundExceptionFilter = {
  provide: APP_FILTER,
  useClass: NotFoundExceptionFilter,
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

const serviceUnAvailableException = {
  provide: APP_FILTER,
  useClass: ServiceUnavailableExceptionFilter,
};

@Module({
  imports: [
    ConfModule,
    CommonModule,
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
    InvoiceCodeSequence,
    PaymentRequestReferenceSequence,
    PaymentTransactionSequence,
  ],
  providers: [
    PortalAccountSequence,
    AssociationCodeSequence,
    ServiceFeeCodeSequence,
    PaymentRequestReferenceSequence,
    BillCodeSequence,
    BankUploadStartup,
    WalletSequence,
    SubscriptionCodeSequence,
    InvoiceCodeSequence,
    PaymentTransactionSequence,
    // CronStartup,
    MembershipCodeSequence,
    illegalArgumentExceptionFilter,
    invalidTokenExceptionFilter,
    unAuthorizedExceptionFilter,
    notActiveExceptionFilter,
    forbiddenExceptionFilter,
    serviceUnAvailableException,
    notFoundExceptionFilter,
  ],
})

export class CoreModule {
}

