import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DaoModule } from '../dao/dao.module';
import { SettingService } from './setting.service';
import { AuthenticationService } from './authentication.service';
import { CommonModule } from '../common/common.module';
import { PortalUserService } from './portal-user.service';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalAccountService } from './portal-account.service';
import { CqrsModule } from '@nestjs/cqrs';
import { MembershipService } from './membership.service';
import { UserManagementService } from './user-management.service';
import { ValidationService } from './validation-service';
import { BEARER_TOKEN_SERVICE } from '../contracts/bearer-token-service';
import { BearerTokenServiceImpl } from './bearer-token-service-impl';


const emailValidationProvider = {
  provide: 'EMAIL_VALIDATION_SERVICE',
  useClass: ValidationService,
};

const bearerTokenServiceProvider = {
  provide: BEARER_TOKEN_SERVICE,
  useClass: BearerTokenServiceImpl,
};


@Module({
  imports: [
    CoreModule,
    DaoModule,
    CommonModule,
    CqrsModule,
  ],
  exports: [
    SettingService,
    AuthenticationService,
    PortalUserService,
    PortalAccountService,
    MembershipService,
    UserManagementService,
    emailValidationProvider,
    bearerTokenServiceProvider,
  ],
  providers: [
    SettingService,
    AuthenticationService,
    PortalUserService,
    PortalAccountService,
    UserManagementService,
    MembershipService,
    emailValidationProvider,
    bearerTokenServiceProvider,
  ],
})
export class ServiceModule {
}
