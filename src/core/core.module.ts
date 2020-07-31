import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';
import { APP_FILTER } from '@nestjs/core';
import { IllegalArgumentExceptionFilter } from './exception-filters/illegal-argument-exception-filter';
import { InvalidTokenExceptionFilter } from './exception-filters/invalid-token-exception.filter';
import { AssociationCodeSequence } from './sequenceGenerators/association-code.sequence';

const illegalArgumentExceptionFilter = {
  provide: APP_FILTER,
  useClass: IllegalArgumentExceptionFilter,
};

const invalidTokenExceptionFilter = {
  provide: APP_FILTER,
  useClass: InvalidTokenExceptionFilter,
};

@Module({
  exports: [
    PortalAccountSequence,
    AssociationCodeSequence,
    BankUploadStartup,
  ],
  providers: [
    PortalAccountSequence,
    AssociationCodeSequence,
    BankUploadStartup,
    illegalArgumentExceptionFilter,
    invalidTokenExceptionFilter,
  ],
})

export class CoreModule {
}
