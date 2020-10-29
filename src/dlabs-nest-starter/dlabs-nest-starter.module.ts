import { Module } from '@nestjs/common';
import { RequestPrincipal } from './security/request-principal.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AccessConstraintInterceptor } from './security/interceptors/access-constraint.interceptor';
import { RemoteAddressInterceptor } from './security/interceptors/remote-address.interceptor';
import { AssociationConstraintInterceptor } from './security/interceptors/association-constraint.interceptor';
import { LoggerInterceptor } from './security/interceptors/logger.interceptor';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
import { ConfModule } from '../conf/conf.module';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    ServiceModule,
    ConfModule,
  ],
  providers: [
    RequestPrincipal,
    {
      provide: APP_INTERCEPTOR,
      useExisting: AccessConstraintInterceptor,
    },
    AccessConstraintInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: RemoteAddressInterceptor,
    },
    RemoteAddressInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: AssociationConstraintInterceptor,
    },
    AssociationConstraintInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: LoggerInterceptor,
    },
    LoggerInterceptor,
  ],
})
export class DlabsNestStarterModule {
}
