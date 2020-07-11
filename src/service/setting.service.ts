import {SettingRepository} from '../dao/setting.repository';
import {Setting} from '../domain/entity/setting.entity';
import {Connection, EntityManager} from 'typeorm';

export class SettingService {

    constructor(private readonly settingsRepository: SettingRepository, private connection: Connection) {
    }

    async getValue(label: string) {
        const setting = await this.settingsRepository.findOneItem({
            label
        });
        return setting?.label;
    }

    async getStringOrCreate(label: string, value: string) {
        return await this.getValue(label) ?? (await this.create(label, value)).value;
    }

    create(label: string, value: string) {
        return this.connection.transaction(async (entityManager) => {
            const setting = new Setting();
            setting.label = label;
            setting.value = value;
            await entityManager.save(setting);
            return setting;
        });

    }
}