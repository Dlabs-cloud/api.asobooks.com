import { Module } from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { PortalAccountRepository } from './portal-account.repository';
import { MembershipRepository } from './membership.repository';
import { PortalUserRepository } from './portal-user.repository';
import { AddressRepository } from './address.repository';
import { CountryRepository } from './country.repository';
import { FileRepository } from './file.repository';
import { AssociationRepository } from './association.repository';
import { BankRepository } from './bank.repository';

@Module({
  providers: [
    SettingRepository,
    PortalAccountRepository,
    PortalUserRepository,
    AddressRepository,
    CountryRepository,
    FileRepository,
    AssociationRepository,
    MembershipRepository,
    BankRepository,
  ],
  exports: [
    SettingRepository,
    MembershipRepository,
    BankRepository,
    PortalUserRepository,
    AddressRepository,
    FileRepository,
    AssociationRepository,
    CountryRepository,
    PortalAccountRepository],
})
export class DaoModule {
}
