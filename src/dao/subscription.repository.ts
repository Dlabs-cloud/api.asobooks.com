import { BaseRepository } from '../common/BaseRepository';
import { Subscription } from '../domain/entity/subcription.entity';
import { EntityRepository } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { Bill } from '../domain/entity/bill.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ServiceSubscriptionSearchQueryDto } from '../dto/service-subscription-search-query.dto';

@EntityRepository(Subscription)
export class SubscriptionRepository extends BaseRepository<Subscription> {


  findByServiceFee(serviceFee: ServiceFee, status = GenericStatusConstant.ACTIVE) {
    return this.findItem({
      serviceFee: serviceFee,
    });
  }

  findByBills(...bills: Bill[]) {
    let subscriptionIds = bills.map(bill => bill.subscriptionId);
    return this.findByIds(subscriptionIds);
  }



}