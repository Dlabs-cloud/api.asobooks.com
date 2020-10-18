import { BaseRepository } from '../common/BaseRepository';
import { Bill } from '../domain/entity/bill.entity';
import { EntityRepository } from 'typeorm';
import { Subscription } from '../domain/entity/subcription.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Bill)
export class BillRepository extends BaseRepository<Bill> {

  findBySubscriptionAndStatus(subscription: Subscription, status = GenericStatusConstant.ACTIVE) {
    return this.findItem({
      subscription:subscription
    }, GenericStatusConstant.ACTIVE);
  }
}