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
import { BillsController } from './membership-workspace/bills.controller';
import { InvoiceController } from './invoice.controller';
import { PaymentRequestController } from './payment-request.controller';
import { PaymentTransactionHandler } from './handlers/payment-transaction.handler';
import { DashboardController } from './dashboard.controller';
import { ActivitiesController } from './activities.controller';
import { SubscriptionHandler } from './handlers/subscription.handler';
import { PaymentTransactionController } from './payment-transaction.controller';
import { MembershipInfoHandler } from './handlers/membership-info.handler';
import { RoleMembershipController } from './role-membership.controller';
import { RoleController } from './role.controller';
import { RoleHandler } from './handlers/role.handler';
import { ServiceFeeHandler } from './handlers/service-fee.handler';
import { BillTransactionsHandler } from './handlers/bill-transactions.handler';
import { SubscriptionController } from './subscription.controller';
import { WalletWithdrawalController } from './wallet-withdrawal.controller';
import { WalletController } from './wallet.controller';
import { AssociationHandler } from './handlers/association.handler';
import { MembershipRolesHandler } from './handlers/membership.roles.handler';
import { PermissionController } from './permission.controller';
import { WalletTransactionHandler } from './handlers/wallet-transaction.handler';

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
    BillsController,
    ServiceFeeController,
    GroupServiceFeeController,
    VerificationController,
    InvoiceController,
    PaymentRequestController,
    DashboardController,
    ActivitiesController,
    SubscriptionController,
    PaymentTransactionController,
    RoleMembershipController,
    RoleController,
    WalletWithdrawalController,
    WalletController,
    PermissionController,
  ],
  providers: [
    ResponseTransformInterceptor,
    LoggedInUserInfoHandler,
    PaymentTransactionHandler,
    SubscriptionHandler,
    MembershipInfoHandler,
    WalletTransactionHandler,
    RoleHandler,
    ServiceFeeHandler,
    BillTransactionsHandler,
    AssociationHandler,
    MembershipRolesHandler,

    {

      provide: APP_INTERCEPTOR,
      useExisting: ResponseTransformInterceptor,
    },
  ],
})
export class ControllerModule {
}
