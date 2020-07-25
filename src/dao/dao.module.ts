import { Module } from '@nestjs/common';
import { SettingRepository } from './setting.repository';
import { PortalAccountRepository } from './portal-account.repository';
import { PortalUserRepository } from './portal-user.repository';
import { AddressRepository } from './address.repository';
import { CountryRepository } from './country.repository';
import { FileRepository } from './file.repository';
import { AssociationRepository } from './association.repository';
import { BankRepository } from './bank.repository';
import { PortalUserAccountRepository } from './portal-user-account.repository';
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
    PortalUserAccountRepository,
    AssociationFileRepository,
    BankRepository,
  ],
  exports: [
    SettingRepository,
    PortalUserAccountRepository,
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
