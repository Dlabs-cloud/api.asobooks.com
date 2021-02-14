import { BaseRepository } from '../common/BaseRepository';
import { Bill } from '../domain/entity/bill.entity';
import { Brackets, EntityRepository } from 'typeorm';
import { Subscription } from '../domain/entity/subcription.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { Association } from '../domain/entity/association.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';
import * as moment from 'moment';
import { ServiceFee } from '../domain/entity/service.fee.entity';

@EntityRepository(Bill)
export class BillRepository extends BaseRepository<Bill> {

  findBySubscriptionAndStatus(subscription: Subscription, status = GenericStatusConstant.ACTIVE) {
    return this.findItem({
      subscription: subscription,
    }, GenericStatusConstant.ACTIVE);
  }

  sumTotalAmountByAssociationAndPaymentStatus(association: Association, paymentStatus?: PaymentStatus, status = GenericStatusConstant.ACTIVE) {
    const queryBuilder = this.createQueryBuilder('bill')
      .where('bill.status = :status')
      .innerJoin(Membership, 'membership', 'bill.membership = membership.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .innerJoin(Association, 'association', 'portalAccount.association = association.id')
      .andWhere('association.id = :associationId');
    if (paymentStatus) {
      queryBuilder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus: paymentStatus });
    }

    return queryBuilder
      .setParameter('associationId', association.id)
      .setParameter('status', status)
      .select('SUM(bill.payableAmountInMinorUnit)')
      .getRawOne().then(result => {
        return Promise.resolve(result.sum);
      });


  }

  findByMembershipAndCode(membership: Membership, ...code: string[]) {
    return this.createQueryBuilder('bill')
      .where('bill.membership = :membership')
      .andWhere('bill.code IN (:...codes)')
      .setParameter('membership', membership.id)
      .setParameter('codes', code)
      .getMany();
  }

  findMembershipBillByQuery(membership: Membership, billSearchQuery: BillSearchQueryDto) {
    let billSelectQueryBuilder = this.createQueryBuilder('bill');
    billSelectQueryBuilder
      .where('bill.membership = :membership')
      .limit(billSearchQuery.limit).offset(billSearchQuery.offset);
    if (billSearchQuery.minAmount) {
      billSelectQueryBuilder.andWhere('bill.payableAmountInMinorUnit >= :minAmount', { minAmount: billSearchQuery.minAmount });
    }
    if (billSearchQuery.maxAmount) {
      billSelectQueryBuilder.andWhere('bill.payableAmountInMinorUnit <= :maxAmount', { maxAmount: billSearchQuery.maxAmount });
    }
    if (billSearchQuery.paymentStatus) {
      billSelectQueryBuilder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus: billSearchQuery.paymentStatus });
    }
    billSelectQueryBuilder.setParameter('membership', membership.id);
    return billSelectQueryBuilder.getManyAndCount();
  }

  countBySubscriptionsAndPaymentStatus(subscriptions: Subscription[], paymentStatus: PaymentStatus) {
    const subscriptionIds = subscriptions.map(subscription => subscription.id);
    return this.createQueryBuilder('bill')
      .where('bill.subscription IN (:...ids)', { ids: subscriptionIds })
      .andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus })
      .select('COUNT(bill.id)')
      .addSelect('bill.subscription')
      .groupBy('bill.subscription')
      .getRawMany();
  }

  countByServiceFeeAndPaymentStatus(serviceFee: ServiceFee, paymentStatus: PaymentStatus) {
    return this.createQueryBuilder('bill')
      .innerJoin(Subscription, 'subscription', 'bill.subscription = subscription.id')
      .where('subscription.serviceFee = :serviceFee', { serviceFee: serviceFee.id })
      .andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus })
      .getCount();
  }

  sumTotalBillByMonthRange(association: Association, startDate: Date, endDate: Date, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('bill')
      .innerJoin(Membership, 'membership', 'bill.membership = membership.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccount = portalAccount.id')
      .where('bill.datePaid >= :startDate', { startDate })
      .andWhere('bill.datePaid <= :endDate', { endDate })
      .andWhere('bill.status = :status', { status })
      .andWhere('portalAccount.association = :association', { association: association.id })
      .select('SUM(bill.totalAmountPaidInMinorUnit)')
      .getRawOne();
  }

  findBySubscriptionAndQuery(subscription: Subscription, query: BillSearchQueryDto, status = GenericStatusConstant.ACTIVE) {
    const builder = this.createQueryBuilder('bill')
      .innerJoin(Membership, 'membership', 'membership.id = bill.membership')
      .innerJoin(PortalUser, 'portalUser', 'portalUser.id = membership.portalUser')
      .where('bill.status = :status', { status: GenericStatusConstant.ACTIVE })
      .andWhere('bill.subscription = :subscription', { subscription: subscription.id })
      .limit(query.limit)
      .offset(query.offset);
    if (query.paymentStatus) {
      builder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus: query.paymentStatus });
    }
    if (query.minAmount) {
      builder.andWhere('bill.payableAmountInMinorUnit >= :minAmount', { minAmount: query.minAmount });
    }
    if (query.maxAmount) {
      builder.andWhere('bill.payableAmountInMinorUnit <= :maxAmount', { maxAmount: query.maxAmount });
    }
    if (query.startDateBefore) {
      const date = moment(query.startDateBefore, 'DD/MM/YYYY').endOf('day').toDate();
      builder.andWhere('bill.billingStartDate <= :startDateBefore', { startDateBefore: date });
    }
    if (query.dateStartAfter) {
      const date = moment(query.dateStartAfter, 'DD/MM/YYYY').startOf('day').toDate();
      builder.andWhere('bill.billingStartDate >= :startDateAfter', { startDateAfter: date });
    }
    if (query.phonenumber) {
      builder.andWhere('portalUser.phoneNumber >= :phonenumber', { phonenumber: query.phonenumber });
    }
    if (query.name) {
      builder.andWhere(new Brackets(qb => {
        qb.orWhere('portalUser.firstName || \' \' || portalUser.lastName ILIKE :path', { path: `%${query.name}%` })
          .orWhere('portalUser.email like :path', { path: `%${query.name}%` })
          .orWhere('portalUser.username like :username', { username: `%${query.name}%` });
      }));
    }
    return builder.getManyAndCount();
  }
}