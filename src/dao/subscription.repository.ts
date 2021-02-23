import { BaseRepository } from '../common/BaseRepository';
import { Subscription } from '../domain/entity/subcription.entity';
import { EntityRepository } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { Bill } from '../domain/entity/bill.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ServiceSubscriptionSearchQueryDto } from '../dto/service-subscription-search-query.dto';
import * as moment from 'moment';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { isUndefined } from 'util';

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

  findByAndServiceFeeQuery(serviceFee: ServiceFee, query: ServiceSubscriptionSearchQueryDto) {
    const builder = this.createQueryBuilder('subscription')
      .where('subscription.serviceFee = :serviceFee', { serviceFee: serviceFee.id })
      .limit(query.limit)
      .offset(query.offset);

    if (query.startDate) {
      builder.andWhere('subscription.startDate >= :date', { date: moment(query.startDate, 'DD/MM/YYYY') });
    }
    if (query.endDate) {
      builder.andWhere('subscription.endDate <= :date', { date: moment(query.endDate, 'DD/MM/YYYY') });
    }

    if (query.amountReceivedInMinorUnitGreater) {
      builder.andWhere('subscription.totalAmountPaid >= :greaterAmount', { greaterAmount: query.amountReceivedInMinorUnitGreater });
    }

    if (query.amountReceivedInMinorUnitLess) {
      builder.andWhere('subscription.totalAmountPaid <= :lessPaidAmount', { lessPaidAmount: query.amountReceivedInMinorUnitLess });
    }

    if (query.amountPendingInMinorUnitGreater) {
      builder.andWhere('subscription.totalPayableAmount >= :greaterPendingAmount', { greaterPendingAmount: query.amountPendingInMinorUnitGreater });
    }

    if (query.amountPendingInMinorUnitLess) {
      builder.andWhere('subscription.totalPayableAmount >= :lessPendingAmount', { lessPendingAmount: query.amountPendingInMinorUnitLess });
    }

    return builder.getManyAndCount();
  }


}