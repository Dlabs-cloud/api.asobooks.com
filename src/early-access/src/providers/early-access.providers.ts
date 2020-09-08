import { EarlyAccessModuleOptions } from '../contracts/early-access-module-options.interface';
import { Provider } from '@nestjs/common';
import { EARLY_ACCESS_OPTIONS } from '../constants/token.constants';
import { EarlyAccessService } from '../contracts/early-access-service.interface';
import { EarlyAccessServiceImpl } from '../impl/early-access-service.impl';
import { EarlyAccessRepositoryImpl } from '../impl/early-access-repository.impl';
import { EarlyAccessRepository } from '../contracts/early-access-repository.interface';
import { PATH_METADATA } from '@nestjs/common/constants';
import { EarlyAccessController } from '../controllers/early-access.controller';
import { HttpAdapterHost } from '@nestjs/core';


export function createEarlyAccessProviders(options: EarlyAccessModuleOptions): Provider[] {
  return [
    {
      provide: EARLY_ACCESS_OPTIONS,
      useValue: options,
    },
  ];
}

export const EarlyAccessServiceProvider = {
  provide: EarlyAccessService,
  useFactory: (repository: EarlyAccessRepository) => {
    return new EarlyAccessServiceImpl(repository);
  },
  inject: [EarlyAccessRepository],

};

export const EarlyAccessRepositoryProvider = {
  provide: EarlyAccessRepository,
  useFactory: (options: EarlyAccessModuleOptions) => {
    return options.repository ? options.repository : new EarlyAccessRepositoryImpl();
  },
  inject: [EARLY_ACCESS_OPTIONS],
};

export const ControllerHackProvider = {
  provide: Symbol('CONTROLLER_HACK'),
  useFactory: (options: EarlyAccessModuleOptions, adapterHost: HttpAdapterHost) => {
    const controllerPrefix = options.url || 'early-access';
    console.log(`${__dirname}/../../../../../src/early-access/assets`);
    adapterHost.httpAdapter.useStaticAssets(`${__dirname}/../../../../../src/early-access/assets`);
    Reflect.defineMetadata(
      PATH_METADATA,
      controllerPrefix,
      EarlyAccessController,
    );
  },
  inject: [EARLY_ACCESS_OPTIONS, HttpAdapterHost],

};





