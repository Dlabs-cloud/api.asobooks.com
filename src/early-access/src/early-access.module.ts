import { DynamicModule, Global, Module } from '@nestjs/common';
import { EarlyAccessModuleOptions } from './contracts/early-access-module-options.interface';
import {
  ControllerHackProvider,
  createEarlyAccessProviders,
  EarlyAccessRepositoryProvider,
  EarlyAccessServiceProvider,
} from './providers/early-access.providers';
import { EarlyAccessController } from './controllers/early-access.controller';
import { ConfigImpl } from './impl/config.impl';


@Global()
@Module({})
export class EarlyAccessModule {
  static BASE_URL: string = '';

  static forRoot(options: EarlyAccessModuleOptions): DynamicModule {
    const providers = [...createEarlyAccessProviders(options), ConfigImpl, EarlyAccessRepositoryProvider, EarlyAccessServiceProvider, ControllerHackProvider];
    return {
      module: EarlyAccessModule,
      controllers: [EarlyAccessController],
      providers: providers,
    };
  }

}
