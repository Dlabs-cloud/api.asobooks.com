import {SequenceEqualOperator} from 'rxjs/internal/operators/sequenceEqual';
import {SequenceGenerator} from './SequenceGenerator';
import {EntityManager, Long} from 'typeorm';
import {OnApplicationBootstrap} from '@nestjs/common';

export abstract class SequenceGeneratorImpl implements SequenceGenerator, OnApplicationBootstrap {
    sequenceTableName: string;
    entityManager: EntityManager;

    protected constructor(sequenceName: string, entityManager: EntityManager) {
        this.sequenceTableName = sequenceName.toLowerCase().concat('_sequence');
        this.entityManager = entityManager;
    }

    // @ts-ignore
    async nextLong(): number {
        const promise = this.entityManager.query(`select nextval ('${this.sequenceTableName}')`);
        const result = await promise;
        return Number(result[0].nextval);

    }

    async next(): Promise<string> {
        return Promise.resolve('');
    }

    onApplicationBootstrap = async (): Promise<any> => {
        // tslint:disable-next-line:max-line-length
        await this.entityManager.query(`DO $$ BEGIN CREATE SEQUENCE ${this.sequenceTableName}; EXCEPTION WHEN duplicate_table THEN END $$ LANGUAGE plpgsql`);
    };

}
