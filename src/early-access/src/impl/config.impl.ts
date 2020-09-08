import { Inject, Injectable } from '@nestjs/common';
import { EARLY_ACCESS_OPTIONS } from '../constants/token.constants';
import { EarlyAccessModuleOptions } from '../contracts/early-access-module-options.interface';

@Injectable()
export class ConfigImpl {

  constructor(@Inject(EARLY_ACCESS_OPTIONS) private readonly earlyAccessModuleOptions: EarlyAccessModuleOptions) {
  }

  public getTwitterHandle() {
    return this.earlyAccessModuleOptions.twitterHandle;
  }

  public twitterShareMessage() {
    return this.earlyAccessModuleOptions.twiterShareMessage;
  }

}