import { Module } from '@nestjs/common';
import { PortalAccountSequence } from './sequenceGenerators/portal-account.sequence';
import { BankUploadStartup } from './start-ups/bank-upload.startup';

@Module({
  exports: [
    PortalAccountSequence,
    BankUploadStartup,
  ],
  providers: [
    PortalAccountSequence,
    BankUploadStartup,
  ],
})

export class CoreModule {
}
