import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { DaoModule } from '../dao/dao.module';
import { CoreModule } from '../core/core.module';
import { CommonModule } from '../common/common.module';
import { TestController } from './test.controller';
import { AuthenticationController } from './authentication.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { UserManagementController } from './user-management.controller';

@Module({
  imports: [
    ServiceModule,
    DaoModule,
    CoreModule,
    CommonModule,
  ],
  controllers: [
    TestController,
    AuthenticationController,
    UserManagementController,
  ],
  providers: [
    ResponseTransformInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: ResponseTransformInterceptor,
    },
  ],
})
export class ControllerModule {
}
