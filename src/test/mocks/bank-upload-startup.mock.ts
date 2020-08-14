import { BankUploadStartup } from '../../core/start-ups/bank-upload.startup';
import { Injectable } from '@nestjs/common';


@Injectable()
export class BankUploadStartupMock extends BankUploadStartup {

  async onApplicationBootstrap(): Promise<void> {
  }
}