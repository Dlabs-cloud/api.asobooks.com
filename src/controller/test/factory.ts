import {getConnection} from 'typeorm';
import * as faker from 'faker';
import {ModelFactoryImpl} from '../../common/test-starter/orm-faker/ModelFactoryImpl';
import {OrmAdapter} from '../../common/test-starter/orm-faker/contracts/OrmAdapter';
import {ModelFactoryRoster} from '../../factories/ModelFactoryRoster';

export function factory() {
    const typeOrmAdapter: OrmAdapter = {
        save<T>(entity: T): Promise<T> {
            return getConnection().transaction(entityManager => {
                return entityManager.save(entity);
            });
        },
    };
    const modelFactory = new ModelFactoryImpl(typeOrmAdapter);
    ModelFactoryRoster.register(modelFactory);
    return modelFactory;
}