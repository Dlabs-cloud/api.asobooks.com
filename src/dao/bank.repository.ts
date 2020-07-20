import { BaseRepository } from '../common/BaseRepository';

import { EntityRepository } from 'typeorm';
import { Bank } from '../domain/entity/bank.entity';

@EntityRepository(Bank)
export class BankRepository extends BaseRepository<Bank> {

}