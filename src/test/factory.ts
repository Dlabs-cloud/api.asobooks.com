import { getConnection } from 'typeorm';
import { ModelFactoryImpl } from '../common/test-starter/orm-faker/ModelFactoryImpl';
import { OrmAdapter } from '../common/test-starter/orm-faker/contracts/OrmAdapter';
import { ModelFactoryRoster } from '../factories/ModelFactoryRoster';

export function factory() {
    const ormAdapter: OrmAdapter = {
        save<T>(entity: T): Promise<T> {
            return getConnection().transaction(entityManager => {
                return entityManager.save(entity);
            });
        },
    };
    const modelFactory = new ModelFactoryImpl(ormAdapter);
    ModelFactoryRoster.register(modelFactory);
    return modelFactory;
}