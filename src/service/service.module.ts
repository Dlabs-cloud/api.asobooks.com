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

@Module({
  imports: [
    CoreModule,
    DaoModule,
    CommonModule,
    CqrsModule
  ],
  exports: [
    SettingService,
    AuthenticationService,
    PortalUserService,
    PortalAccountService,
  ],
  providers: [
    SettingService,
    AuthenticationService,
    PortalUserService,
    PortalAccountService,
  ],
})
export class ServiceModule {
}
