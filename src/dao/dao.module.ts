import { Module } from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { PortalAccountRepository } from './portal-account.repository';
import { PortalUserRepository } from './portal-user.repository';
import { AddressRepository } from './address.repository';
import { CountryRepository } from './country.repository';
import { FileRepository } from './file.repository';
import { AssociationRepository } from './association.repository';
import { BankRepository } from './bank.repository';
import { MembershipRepository } from './membership.repository';
import { AssociationFileRepository } from './association.file.repository';

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
    AssociationFileRepository,
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
    AssociationFileRepository,
    CountryRepository,
    PortalAccountRepository],
})
export class DaoModule {
}
