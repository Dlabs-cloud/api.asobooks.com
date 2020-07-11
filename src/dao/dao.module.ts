import {Module} from '@nestjs/common';
import {SettingRepository} from './setting.repository';
import {PortalAccountRepository} from './portal-account.repository';

@Module({
    providers: [
        SettingRepository,
        PortalAccountRepository,
    ],
    exports: [
        SettingRepository,
        PortalAccountRepository]
})
export class DaoModule {
}
