import {Setting} from '../../domain/entity/setting.entity';
import {getConnection} from 'typeorm';
import {SettingRepository} from '../../dao/setting.repository';
import {Some} from 'optional-typescript';

export class TestUtils {

    static async init() {

        const setting = await getConnection().getCustomRepository(SettingRepository).findOneItem({
            label: 'trusted_ip_address',
        });

        await Some(setting).valueOrAsync(async () => {
            const newSetting = new Setting();
            newSetting.label = 'trusted_ip_address';
            newSetting.value = '::ffff:127.0.0.1';
            return getConnection().transaction(async entityManager => {
                return await entityManager.save(newSetting);
            });
        });

    }

}
