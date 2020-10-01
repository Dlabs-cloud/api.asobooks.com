import { BaseRepository } from '../common/BaseRepository';
import { Bill } from '../domain/entity/bill.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Bill)
export class BillRepository extends BaseRepository<Bill> {

}