import {EntityManager, Long} from 'typeorm';

export interface SequenceGenerator {
    nextLong(entityManager: EntityManager): number;

    next(): Promise<string>;
}
