import { forwardRef, Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DaoModule } from '../dao/dao.module';
import { AuthenticationService } from './authentication.service';
import { CommonModule } from '../common/common.module';
import { PortalUserService } from './portal-user.service';
import { PortalAccountService } from './portal-account.service';
import { CqrsModule } from '@nestjs/cqrs';
import { MembershipService } from './membership.service';
import { UserManagementService } from './user-management.service';
import { AssociationServiceImpl } from './association.service-impl';
import { BankInfoService } from './bank-info.service';
import { AssociationFileService } from './association-file.service';
import { ServiceFeeService } from './service-fee.service';
import { GroupService } from './group.service';
import { GroupServiceFeeService } from './group-service-fee.service';
import { SubscriptionService } from './subscription.service';
import { ConfigModule } from '@nestjs/config';
import { BillService } from './bill.service';
import { ConfModule } from '../conf/conf.module';
import { CachedAssociationServiceImpl } from './cached-association.service-impl';
import { ServiceModule } from '../service/service.module';
import { WalletService } from './wallet.service';
import { InvoiceService } from './invoice.service';
import { PaymentRequestService } from './payment-request.service';
import { PaymentTransactionService } from './payment-transaction.service';
import { BankService } from './bank.service';
import { FakerService } from './faker.service';
import { MembershipInfoService } from './membership-info.service';
import { AddressService } from './address.service';
import { RoleService } from './role.service';
import { WalletWithdrawalService } from './wallet-withdrawal.service';
import { WalletTransactionService } from './wallet-transaction.service';


@Module({
  imports: [
    CoreModule,
    ConfModule,
    DaoModule,
    CommonModule,
    CqrsModule,
    ConfigModule,
    forwardRef(() => ServiceModule),
  ],
  exports: [
    AuthenticationService,
    PortalUserService,
    PortalAccountService,
    PaymentRequestService,
    MembershipService,
    UserManagementService,
    AssociationServiceImpl,
    BankInfoService,
    InvoiceService,
    AssociationFileService,
    ServiceFeeService,
    GroupServiceFeeService,
    SubscriptionService,
    UserManagementService,
    GroupService,
    BillService,
    CachedAssociationServiceImpl,
    AssociationServiceImpl,
    WalletService,
    BankService,
    RoleService,
    PaymentTransactionService,
    AddressService,
    WalletWithdrawalService,
    WalletTransactionService,
  ],
  providers: [
    AuthenticationService,
    PortalUserService,
    InvoiceService,
    PortalAccountService,
    UserManagementService,
    BankInfoService,
    SubscriptionService,
    GroupService,
    ServiceFeeService,
    AssociationFileService,
    PaymentRequestService,
    MembershipService,
    AssociationServiceImpl,
    CachedAssociationServiceImpl,
    UserManagementService,
    AddressService,
    GroupServiceFeeService,
    PaymentTransactionService,
    BankService,
    WalletService,
    RoleService,
    BillService,
    FakerService,
    MembershipInfoService,
    WalletWithdrawalService,
    WalletTransactionService,
  ],
})
export class ServiceImplModule {
}
