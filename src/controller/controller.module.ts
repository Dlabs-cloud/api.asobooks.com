import { Module } from '@nestjs/common';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
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
import { VerificationController } from './verification-controller';
import { MembershipBillsController } from './membership-bills.controller';
import { InvoiceController } from './invoice.controller';
import { PaymentRequestController } from './payment-request.controller';
import { PaymentTransactionHandler } from './handlers/payment-transaction.handler';
import { DashboardController } from './dashboard.controller';
import { ActivitiesController } from './activities.controller';
import { SubscriptionHandler } from './handlers/subscriptionHandler';
import { PaymentTransactionController } from './payment-transaction.controller';

@Module({
  imports: [
    ServiceImplModule,
    ServiceModule,
    DaoModule,
    CoreModule,
    CommonModule],
  controllers: [
    TestController,
    AuthenticationController,
    MembershipManagementController,
    AssociationController,
    MasterRecordController,
    MembershipBillsController,
    ServiceFeeController,
    GroupServiceFeeController,
    VerificationController,
    InvoiceController,
    PaymentRequestController,
    DashboardController,
    ActivitiesController,
    PaymentTransactionController,
  ],
  providers: [
    ResponseTransformInterceptor,
    LoggedInUserInfoHandler,
    PaymentTransactionHandler,
    SubscriptionHandler,
    {

      provide: APP_INTERCEPTOR,
      useExisting: ResponseTransformInterceptor,
    },
  ],
})
export class ControllerModule {
}
