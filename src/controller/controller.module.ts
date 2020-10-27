import { Module } from '@nestjs/common';
import { ServiceImplModule } from '../service-impl/serviceImplModule';
import { DaoModule } from '../dao/dao.module';
import { CoreModule } from '../core/core.module';
import { CommonModule } from '../common/common.module';
import { TestController } from './test.controller';
import { AuthenticationController } from './authentication.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { MembershipManagementController } from './membership-management.controller';
import { AssociationController } from './association.controller';
import { LoggedInUserInfoHandler } from './handlers/logged-in-user-info.handler';
import { ServiceFeeController } from './service-fee.controller';
import { MasterRecordController } from './master-record-controller';
import { GroupServiceFeeController } from './group-service-fee.controller';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    ServiceImplModule,
    ServiceModule,
    DaoModule,
    CoreModule,
    CommonModule,
  ],
  controllers: [
    TestController,
    AuthenticationController,
    MembershipManagementController,
    AssociationController,
    MasterRecordController,
    ServiceFeeController,
    GroupServiceFeeController,
  ],
  providers: [
    ResponseTransformInterceptor,
    LoggedInUserInfoHandler,
    {

      provide: APP_INTERCEPTOR,
      useExisting: ResponseTransformInterceptor,
    },
  ],
})
export class ControllerModule {
}
