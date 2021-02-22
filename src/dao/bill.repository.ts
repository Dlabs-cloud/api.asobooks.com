import { BaseRepository } from '../common/BaseRepository';
import { Bill } from '../domain/entity/bill.entity';
import { Brackets, EntityRepository, SelectQueryBuilder } from 'typeorm';
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
import { BillQueryDto } from '../dto/bill-query.dto';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { Invoice } from '../domain/entity/invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';

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


  findByServiceFeeAndQuery(serviceFee: ServiceFee, query: BillQueryDto, status = GenericStatusConstant.ACTIVE) {
    const billSelectQueryBuilder = this.createQueryBuilder('bill')
      .select(['bill.id', 'paymentTransaction.id'])
      .innerJoin(Membership, 'membership', 'membership.id = bill.membership')
      .innerJoin(PortalUser, 'portalUser', 'portalUser.id = membership.portalUser')
      .innerJoin(Subscription, 'subscription', 'bill.subscription = subscription.id')
      .innerJoin(ServiceFee, 'serviceFee', 'subscription.serviceFee = serviceFee.id')
      .leftJoin(BillInvoice, 'billInvoice', 'billInvoice.bill = bill.id')
      .leftJoin(Invoice, 'invoice', 'billInvoice.invoice = invoice.id')
      .leftJoin(PaymentRequest, 'paymentRequest', 'paymentRequest.invoice = invoice.id')
      .leftJoin(PaymentTransaction, 'paymentTransaction', 'paymentTransaction.paymentRequest = paymentRequest.id')
      .where('bill.status = :status', { status: GenericStatusConstant.ACTIVE })
      .andWhere('subscription.serviceFee = :serviceFee', { serviceFee: serviceFee.id })
      .andWhere('bill.status =:status', { status })
      .limit(query.limit)
      .offset(query.offset);

    if (query.feeType) {
      billSelectQueryBuilder.andWhere('serviceFee.type = :type', { type: query.feeType });
    }

    this.billSearchQuery(query, billSelectQueryBuilder);
    const builderClone = billSelectQueryBuilder.clone();
    return this.extractBillPaymentTransaction(billSelectQueryBuilder, builderClone);


  }


  findBySubscriptionAndQuery(subscription: Subscription, query: BillQueryDto, status = GenericStatusConstant.ACTIVE) {
    const builder = this.createQueryBuilder().from(Bill, 'bill')
      .select(['bill.id', 'paymentTransaction.id'])
      .innerJoin(Membership, 'membership', 'membership.id = bill.membership')
      .innerJoin(PortalUser, 'portalUser', 'portalUser.id = membership.portalUser')
      .leftJoin(BillInvoice, 'billInvoice', 'billInvoice.bill = bill.id')
      .leftJoin(Invoice, 'invoice', 'billInvoice.invoice = invoice.id')
      .leftJoin(PaymentRequest, 'paymentRequest', 'paymentRequest.invoice = invoice.id')
      .leftJoin(PaymentTransaction, 'paymentTransaction', 'paymentTransaction.paymentRequest = paymentRequest.id')
      .where('bill.status = :status', { status: GenericStatusConstant.ACTIVE })
      .andWhere('bill.subscription = :subscription', { subscription: subscription.id })
      .andWhere('bill.status =:status', { status })
      .limit(query.limit)
      .offset(query.offset);
    this.billSearchQuery(query, builder);

    const builderClone = builder.clone();
    return this.extractBillPaymentTransaction(builder, builderClone);

  }


  private billSearchQuery(query: BillQueryDto, builder: SelectQueryBuilder<Bill>) {

    if (query.paymentStatus) {
      builder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus: query.paymentStatus });
    }
    if (query.createdDateBefore) {
      const date = moment(query.createdDateBefore, 'DD/MM/YYYY').endOf('day').toDate();
      builder.andWhere('bill.createdAt <= :startDateBefore', { startDateBefore: date });
    }
    if (query.createdDateAfter) {
      const date = moment(query.createdDateAfter, 'DD/MM/YYYY').startOf('day').toDate();
      builder.andWhere('bill.createdAt >= :startDateAfter', { startDateAfter: date });
    }
    if (query.phoneNumber) {
      builder.andWhere('portalUser.phoneNumber >= :phonenumber', { phonenumber: query.phoneNumber });
    }
    if (query.name) {
      builder.andWhere(new Brackets(qb => {
        qb.orWhere('portalUser.firstName || \' \' || portalUser.lastName ILIKE :name', { name: `%${query.name}%` })
          .orWhere('portalUser.email like :path', { path: `%${query.name}%` })
          .orWhere('portalUser.username like :username', { username: `%${query.name}%` });
      }));
    }
    if (query.receiptNumber) {
      const reference = query.receiptNumber;
      builder.andWhere('paymentTransaction.reference = :reference', { reference });
    }
    if (query.timeOfPaymentBefore) {
      const date = moment(query.timeOfPaymentBefore, 'DD/MM/YYYY').endOf('day').toDate();
      builder.andWhere('paymentTransaction.confirmedPaymentDate <= :timeOfPaymentBefore', { timeOfPaymentBefore: date });
    }
    if (query.timeOfPaymentAfter) {
      const date = moment(query.timeOfPaymentAfter, 'DD/MM/YYYY').startOf('day').toDate();
      builder.andWhere('paymentTransaction.confirmedPaymentDate >= :timeOfPaymentAfter', { timeOfPaymentAfter: date });
    }
  }

  private extractBillPaymentTransaction(billSelectQueryBuilder: SelectQueryBuilder<Bill>, builderClone: SelectQueryBuilder<Bill>) {
    const billPaymentTransactionId: Map<Bill, number> = new Map<Bill, number>();
    return billSelectQueryBuilder.getRawMany().then(billTransactions => {
      const billIds = billTransactions.map(billTransaction => billTransaction.bill_id);
      return this.findByIds(billIds).then(bills => {
        bills.forEach(bill => {
          const billTransaction = billTransactions.find(billTransaction => billTransaction.bill_id === bill.id);
          billPaymentTransactionId.set(bill, billTransaction.paymentTransaction_id);
        });
      });
    }).then(() => {
      return builderClone.getCount().then(count => {
        return Promise.resolve([billPaymentTransactionId, count]);
      });
    });
  }
}