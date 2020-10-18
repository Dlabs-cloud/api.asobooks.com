import { Process, Processor } from '@nestjs/bull';
import { Connection } from 'typeorm';
import { SubscriptionRepository } from '../../dao/subscription.repository';
import { ServiceFee } from '../../domain/entity/service.fee.entity';
import { GroupServiceFee } from '../../domain/entity/group-sevice-fee.entity';
import { Group } from '../../domain/entity/group.entity';
import { GroupMembership } from '../../domain/entity/group-membership.entity';
import { Membership } from '../../domain/entity/membership.entity';
import { Bill } from '../../domain/entity/bill.entity';
import { Subscription } from '../../domain/entity/subcription.entity';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { ServiceFeeRepository } from '../../dao/service-fee.repository';
import { MembershipRepository } from '../../dao/membership.repository';
import { BillService } from '../../service/bill.service';
import { CollectionUtils } from '../../common/utils/collection-utils';
import { Queues } from '../../core/cron.enum';

@Processor(Queues.BILL_GENERATION)
export class BillGeneratorProcessor {
  constructor(private readonly connection: Connection, private readonly billService: BillService) {
  }

  @Process()
  async handler() {

    let subscriptionMemberships: { subscriptionId: number, membershipId: number, serviceFeeId: number }[] = await this.connection
      .createQueryBuilder()
      .from(Subscription, 'subscription')
      .select('subscription.id', 'subscriptionId')
      .addSelect('membership.id', 'membershipId')
      .addSelect('serviceFee.id ', 'serviceFeeId')
      .innerJoin(ServiceFee, 'serviceFee', 'serviceFee.id = subscription.serviceFee')
      .innerJoin(GroupServiceFee, 'groupServiceFee', 'groupServiceFee.serviceFee = serviceFee.id')
      .innerJoin(Group, 'group', 'groupServiceFee.group = group.id')
      .innerJoin(GroupMembership, 'groupMembership', 'groupMembership.group = group.id ')
      .innerJoin(Membership, 'membership', 'membership.id = groupMembership.membership')
      .where('subscription.status = :status')
      .andWhere('groupServiceFee.status = :status')
      .andWhere('group.status = :status')
      .andWhere('groupMembership.status = :status')
      .andWhere('membership.status = :status')
      .setParameter('status', GenericStatusConstant.ACTIVE)
      .andWhere(qb => {
        let query = qb.subQuery()
          .select('bill.subscription')
          .from(Bill, 'bill')
          .where('bill.status = :status')
          .getQuery();
        return `subscription.id NOT IN ${query}`;
      })
      .take(200)
      .getRawMany();
    let subscriptionsGroupBy = CollectionUtils.groupBy(subscriptionMemberships, (r) => r.subscriptionId);
    let subscriptionIds = subscriptionMemberships.map(result => result.subscriptionId);
    let membershipIds = subscriptionMemberships.map(result => result.membershipId);
    let serviceFeeIds = subscriptionMemberships.map(result => result.serviceFeeId);

    let subscriptions = await this.connection
      .getCustomRepository(SubscriptionRepository)
      .findById(GenericStatusConstant.ACTIVE, ...subscriptionIds);
    let memberships = await this.connection
      .getCustomRepository(MembershipRepository)
      .findById(GenericStatusConstant.ACTIVE, ...membershipIds);
    let serviceFees = await this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findById(GenericStatusConstant.ACTIVE, ...serviceFeeIds);

    let map: Promise<Bill[]>[] = subscriptions.map(subscription => {
      subscription.serviceFee = serviceFees
        .find(serviceFee => serviceFee.id === subscription.serviceFeeId);

      let pendingSubscriptions = subscriptionsGroupBy[subscription.id] as { subscriptionId: number, membershipId: number }[];
      let bills: Promise<Bill>[] = pendingSubscriptions
        .map(pendingSubscription => {
          let membership = memberships
            .find(membership => membership.id === pendingSubscription.membershipId);
          return this.billService.createSubscriptionBill(subscription, membership);
        });
      return Promise.all(bills);
    });
    return Promise.all(map);

  }


}