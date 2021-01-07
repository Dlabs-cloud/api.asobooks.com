import { BaseRepository } from '../common/BaseRepository';
import { Bill } from '../domain/entity/bill.entity';
import { EntityRepository } from 'typeorm';
import { Subscription } from '../domain/entity/subcription.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { Association } from '../domain/entity/association.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PortalAccount } from '../domain/entity/portal-account.entity';

@EntityRepository(Bill)
export class BillRepository extends BaseRepository<Bill> {

  findBySubscriptionAndStatus(subscription: Subscription, status = GenericStatusConstant.ACTIVE) {
    return this.findItem({
      subscription: subscription,
    }, GenericStatusConstant.ACTIVE);
  }

  sumTotalAmountOnBills(association: Association, paymentStatus?: PaymentStatus, status = GenericStatusConstant.ACTIVE) {
    const queryBuilder = this.createQueryBuilder('bill')
      .where('bill.status = :status')
      .innerJoin(Membership, 'membership', 'bill.membershipId = membership.id')
      .innerJoin(PortalAccount, 'portalAccount', 'membership.portalAccountId = portalAccount.id')
      .innerJoin(Association, 'association', 'portalAccount.associationId = association.id')
      .andWhere('association.id = : associationId');
    if (paymentStatus) {
      queryBuilder.andWhere('bill.paymentStatus = :paymentStatus', { paymentStatus: paymentStatus });
    }

    return queryBuilder.setParameter('associationId', association.id)
      .setParameter('status', status)
      .select('SUM(bill.payableAmountInMinorUnit)', 'sum')
      .getRawOne();


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