import { BaseRepository } from '../common/BaseRepository';
import { Bill } from '../domain/entity/bill.entity';
import { EntityRepository } from 'typeorm';
import { Subscription } from '../domain/entity/subcription.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';

@EntityRepository(Bill)
export class BillRepository extends BaseRepository<Bill> {

  findBySubscriptionAndStatus(subscription: Subscription, status = GenericStatusConstant.ACTIVE) {
    return this.findItem({
      subscription: subscription,
    }, GenericStatusConstant.ACTIVE);
  }


  findMembershipBillByQuery(membership: Membership, billSearchQuery: BillSearchQueryDto) {
    let limit = billSearchQuery.limit || 20;
    let offSet = billSearchQuery.offSet || 0;
    let billSelectQueryBuilder = this.createQueryBuilder('bill');
    billSelectQueryBuilder
      .where('bill.membership = :membership')
      .limit(limit).offset(offSet);
    if (billSearchQuery.minAmount) {
      billSelectQueryBuilder.andWhere('bill.payableAmountInMinorUnit >= :minAmount', { minAmount: billSearchQuery.minAmount });
    }
    if (billSearchQuery.maxAmount) {
      billSelectQueryBuilder.andWhere('bill.payableAmountInMinorUnit <= :maxAmount', { minAmount: billSearchQuery.maxAmount });
    }
    if (billSearchQuery.paymentStatus) {
      billSelectQueryBuilder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus: billSearchQuery.paymentStatus });
    }
    billSelectQueryBuilder.setParameter('membership', membership.id);
    return billSelectQueryBuilder.getManyAndCount();
  }
}