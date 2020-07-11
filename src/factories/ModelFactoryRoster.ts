import {ModelFactory} from '../common/test-starter/orm-faker/contracts/ModelFactory';
import {Setting} from '../domain/entity/setting.entity';
import {SettingModelFactory} from './factory/setting-model-factory';

export class ModelFactoryRoster {
    static register(modelFactory: ModelFactory) {
        modelFactory.register<Setting, SettingModelFactory>(Setting, SettingModelFactory);
    }
}
