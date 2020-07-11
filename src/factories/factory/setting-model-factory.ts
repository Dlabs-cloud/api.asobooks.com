import {FactoryHelper} from '../../common/test-starter/orm-faker/contracts/FactoryHelper';
import {Setting} from '../../domain/entity/setting.entity';
import {ModelFactory} from '../../common/test-starter/orm-faker/contracts/ModelFactory';

export class SettingModelFactory implements FactoryHelper<Setting> {

    async apply(faker: Faker.FakerStatic, modelFactory: ModelFactory): Promise<Setting> {
        const setting = new Setting();
        setting.label = faker.name.lastName() + '_' + faker.name.firstName();
        setting.value = faker.internet.ip();
        return setting;

    }

}