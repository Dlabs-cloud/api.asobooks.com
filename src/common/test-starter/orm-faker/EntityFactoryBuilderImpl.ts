
import {EntityFactoryBuilder} from './contracts/EntityFactoryBuilder';
import FakerStatic = Faker.FakerStatic;
import {FactoryHelper} from './contracts/FactoryHelper';
import {ModelFactory} from './contracts/ModelFactory';
import {FactoryInstantiationException} from './exceptions/FactoryInstantiationException';
import {OrmAdapter} from './contracts/OrmAdapter';

export class EntityFactoryBuilderImpl<T> implements EntityFactoryBuilder<T> {

    private operator: (t: T) => T;

    constructor(private factoryTag: string,
                private definitions: Map<any, FactoryHelper<T>>,
                private faker: FakerStatic,
                private modelFactory: ModelFactory,
                private ormAdapter: OrmAdapter) {
    }

    private makeInstance(): Promise<T> {
        if (!this.definitions.has(this.factoryTag)) {
            throw new FactoryInstantiationException(`😛 Unable to locate the factory with tag ${this.factoryTag}, Are you sure you registered a factory with a tag?
            Hint: Implement FactoryHelper<~> and the rest will happen like a magic 🤪
            `);
        }
        const func: FactoryHelper<T> = this.definitions.get(this.factoryTag);

        return func.apply(this.faker, this.modelFactory);

    }

    async create(): Promise<T> {
        const entities: T[] = await this.createMany(1);
        return entities[0];

    }

    async createMany(count: number): Promise<T[]> {
        const persistedInstances = (await this.makeMany(count)).map(instance => {
            return this.ormAdapter.save(instance);
        });
        return await Promise.all(persistedInstances);
    }

    public async makeMany(count: number): Promise<T[]> {
        const instances: T[] = [];
        for (let i = 0; i < count; i++) {
            instances.push(await this.make());
        }

        return instances;
    }

    public async make(): Promise<T> {
        if (this.operator != null) {
            return this.operator(await this.makeInstance());
        }
        return await this.makeInstance();
    }

    use(callBack: (t: T) => T): EntityFactoryBuilder<T> {
        if (this.operator != null) {
            this.operator = val => callBack(this.operator(val));
        } else {
            this.operator = callBack;
        }

        return this;
    }
}
