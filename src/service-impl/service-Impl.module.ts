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
import { ValidationService } from './validation-service';
import { BEARER_TOKEN_SERVICE } from '../dlabs-nest-starter/interfaces/i-bearer-token-service';
import { BearerTokenService } from './bearer-token.service';
import { AssociationServiceImpl } from './association.service-impl';
import { FILE_SERVICE } from '../contracts/i-file-service';
import { AmazonS3FileService } from './amazon-s3-file.service';
import { BankInfoService } from './bank-info.service';
import { AssociationFileService } from './association-file.service';
import { ServiceFeeService } from './service-fee.service';
import { EarlyAccessService } from './early-access.service';
import { GroupService } from './group.service';
import { GroupServiceFeeService } from './group-service-fee.service';
import { SubscriptionService } from './subscription.service';
import { ConfigModule } from '@nestjs/config';
import { BillService } from './bill.service';
import { ConfModule } from '../conf/conf.module';
import { CachedAssociationServiceImpl } from './cached-association.service-impl';
import { ServiceModule } from '../service/service.module';


;


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
    MembershipService,
    UserManagementService,
    AssociationServiceImpl,
    BankInfoService,
    AssociationFileService,
    ServiceFeeService,
    EarlyAccessService,
    GroupServiceFeeService,
    SubscriptionService,
    GroupService,
    BillService,
    CachedAssociationServiceImpl,
    AssociationServiceImpl,
  ],
  providers: [
    AuthenticationService,
    PortalUserService,
    EarlyAccessService,
    PortalAccountService,
    UserManagementService,
    BankInfoService,
    SubscriptionService,
    GroupService,
    ServiceFeeService,
    AssociationFileService,
    MembershipService,
    AssociationServiceImpl,
    CachedAssociationServiceImpl,
    GroupServiceFeeService,

    BillService,
  ],
})
export class ServiceImplModule {
}
