import * as faker from 'faker';
import {FactoryHelper} from './contracts/FactoryHelper';
import {EntityFactoryBuilderImpl} from './EntityFactoryBuilderImpl';
import {EntityFactoryBuilder} from './contracts/EntityFactoryBuilder';
import {ModelFactory} from './contracts/ModelFactory';
import {OrmAdapter} from './contracts/OrmAdapter';
import {ObjectType} from 'typeorm';

export class ModelFactoryImpl implements ModelFactory {
    private definitions: Map<string, any> = new Map<string, FactoryHelper<any>>();

    constructor(private ormAdapter: OrmAdapter) {
    }

    public register<Entity, Mocker extends FactoryHelper<Entity>>(entity, type: (new () => Mocker)) {
        this.define(entity, type);
    }

    private define<Entity, Mocker extends FactoryHelper<Entity>>(entity, type: (new () => Mocker)) {
        const factoryHelperInstance = new type();
        this.definitions.set(this.getNameOfEntity(entity), factoryHelperInstance);
    }

    private getNameOfEntity<Entity>(entity: ObjectType<Entity>) {
        if (entity instanceof Function) {
            return entity.name;
        } else if (entity) {
            return new (entity as any)().constructor.name;
        }
        throw new Error('Enity is not defined');
    }

    public create<T>(entity: ObjectType<T>): Promise<T> {
        if (!entity) {
            throw Error('Factory tag cannot be undefined when creating a factory');
        }
        return this.of<T>(entity).create();
    }

    private of<T>(entity: ObjectType<T>): EntityFactoryBuilder<T> {
        return new EntityFactoryBuilderImpl<T>(this.getNameOfEntity(entity), this.definitions, faker, this, this.ormAdapter);
    }

    public async make<T>(entity: ObjectType<T>): Promise<T> {
        return await this.of<T>(entity).make();
    }

    public async makeMany<T>(count: number, entity: ObjectType<T>) {
        return await this.of<T>(entity).makeMany(count);
    }

    createMany<T>(count: number, entity: ObjectType<T>): Promise<T[]> {
        return this.of<T>(entity).createMany(count);
    }

    upset<Entity>(entity: ObjectType<Entity>): EntityFactoryBuilder<Entity> {
        return this.of<Entity>(entity);
    }

}
