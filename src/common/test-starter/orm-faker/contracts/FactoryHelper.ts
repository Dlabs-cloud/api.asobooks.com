import FakerStatic = Faker.FakerStatic;
import {ModelFactory} from './ModelFactory';

export interface FactoryHelper<T> {
    apply(faker: FakerStatic, modelFactory: ModelFactory): Promise<T>;
}
