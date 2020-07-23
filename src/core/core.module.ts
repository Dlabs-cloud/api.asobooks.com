import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';
import { APP_FILTER } from '@nestjs/core';
import { IllegalArgumentExceptionFilter } from './exceptio-filters/illegal-argument-exception-filter';
import { InvalidTokenExceptionFilter } from './exceptio-filters/invalid-token-exception.filter';

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
    BankUploadStartup,
  ],
  providers: [
    PortalAccountSequence,
    BankUploadStartup,
    illegalArgumentExceptionFilter,
    invalidTokenExceptionFilter,
  ],
})

export class CoreModule {
}
