import { Module } from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { PortalAccountRepository } from './portal-account.repository';
import { MembershipRepository } from './membership.repository';
import { PortalUserRepository } from './portal-user.repository';

@Module({
  providers: [
    SettingRepository,
    PortalAccountRepository,
    PortalUserRepository,
    MembershipRepository,
  ],
  exports: [
    SettingRepository,
    MembershipRepository,
    PortalUserRepository,
    PortalAccountRepository],
})
export class DaoModule {
}
