import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';
import { APP_FILTER } from '@nestjs/core';
import { IllegalArgumentExceptionFilter } from './exceptio-filters/illegal-argument-exception-filter';

const illegalArgumentExceptionFilter = {
  provide: APP_FILTER,
  useClass: IllegalArgumentExceptionFilter,
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
  ],
})

export class CoreModule {
}
